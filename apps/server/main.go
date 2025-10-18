package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

// Data structures
type User struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Auth0Sub string `json:"auth0_sub"`
	Profile  *UserProfile `json:"profile,omitempty"`
}

type UserProfile struct {
	DarkMode         bool   `json:"dark_mode"`
	SoundEnabled     bool   `json:"sound_enabled"`
	DefaultTemplate  string `json:"default_template"`
}

type TimerTemplate struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Duration        int64  `json:"duration"`
	Direction       string `json:"direction"`
	BackgroundColor string `json:"background_color"`
	TextColor       string `json:"text_color"`
	FontSize        int    `json:"font_size"`
	IsBuiltIn       bool   `json:"is_built_in"`
}

type TimerHistoryEntry struct {
	ID              string `json:"id"`
	TimerName       string `json:"timer_name"`
	Duration        int64  `json:"duration"`
	CompletedAt     int64  `json:"completed_at"`
	UserID          string `json:"user_id"`
	RoomID          string `json:"room_id"`
}

type Room struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	CreatedBy   string           `json:"created_by"`
	Users       map[string]*User `json:"users"`
	Timers      map[string]*Timer `json:"timers"`
	InviteCode  string           `json:"invite_code"`
	mu          sync.RWMutex
}

type Timer struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Duration        int64  `json:"duration"`     // in seconds
	ElapsedTime     int64  `json:"elapsed_time"` // in seconds
	IsRunning       bool   `json:"is_running"`
	Direction       string `json:"direction"` // "forward" or "backward"
	CreatedAt       int64  `json:"created_at"`
	BackgroundColor string `json:"background_color"`
	TextColor       string `json:"text_color"`
	FontSize        int    `json:"font_size"`
}

type WSMessage struct {
	Type    string          `json:"type"`
	RoomID  string          `json:"room_id,omitempty"`
	TimerID string          `json:"timer_id,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

// Global state
var (
	rooms          = make(map[string]*Room)
	roomsMu        sync.RWMutex
	templates      = make(map[string]*TimerTemplate)
	templatesMu    sync.RWMutex
	userProfiles   = make(map[string]*UserProfile)
	profilesMu     sync.RWMutex
	timerHistory   = make(map[string][]*TimerHistoryEntry) // key: userID
	historyMu      sync.RWMutex
	upgrader       = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins for development
		},
	}
	clients   = make(map[*websocket.Conn]*Client)
	clientsMu sync.RWMutex
)

type Client struct {
	Conn   *websocket.Conn
	UserID string
	RoomID string
}

func main() {
	// Load environment variables
	godotenv.Load()

	// Initialize built-in timer templates
	initBuiltInTemplates()

	router := mux.NewRouter()

	// REST API endpoints
	router.HandleFunc("/health", healthHandler).Methods("GET")
	router.HandleFunc("/api/rooms", createRoomHandler).Methods("POST")
	router.HandleFunc("/api/rooms", listRoomsHandler).Methods("GET")
	router.HandleFunc("/api/rooms/{roomId}", getRoomHandler).Methods("GET")
	router.HandleFunc("/api/rooms/{roomId}/join", joinRoomHandler).Methods("POST")
	router.HandleFunc("/api/rooms/invite/{inviteCode}", joinRoomByInviteHandler).Methods("POST")
	
	// Timer template endpoints
	router.HandleFunc("/api/templates", getTemplatesHandler).Methods("GET")
	
	// User profile endpoints
	router.HandleFunc("/api/users/{userId}/profile", getUserProfileHandler).Methods("GET")
	router.HandleFunc("/api/users/{userId}/profile", updateUserProfileHandler).Methods("PUT")
	
	// Timer history endpoints
	router.HandleFunc("/api/users/{userId}/history", getTimerHistoryHandler).Methods("GET")
	router.HandleFunc("/api/users/{userId}/history", addTimerHistoryHandler).Methods("POST")

	// WebSocket endpoint
	router.HandleFunc("/ws", wsHandler)

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func createRoomHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name      string `json:"name"`
		UserID    string `json:"user_id"`
		UserEmail string `json:"user_email"`
		UserName  string `json:"user_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	roomID := generateID()
	inviteCode := generateInviteCode()
	room := &Room{
		ID:         roomID,
		Name:       req.Name,
		CreatedBy:  req.UserID,
		InviteCode: inviteCode,
		Users:      make(map[string]*User),
		Timers:     make(map[string]*Timer),
	}

	room.Users[req.UserID] = &User{
		ID:    req.UserID,
		Email: req.UserEmail,
		Name:  req.UserName,
	}

	roomsMu.Lock()
	rooms[roomID] = room
	roomsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(room)
}

func generateInviteCode() string {
	const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Exclude confusing characters
	b := make([]byte, 6)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}

func listRoomsHandler(w http.ResponseWriter, r *http.Request) {
	roomsMu.RLock()
	defer roomsMu.RUnlock()

	roomList := make([]*Room, 0, len(rooms))
	for _, room := range rooms {
		roomList = append(roomList, room)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roomList)
}

func getRoomHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomID := vars["roomId"]

	roomsMu.RLock()
	room, exists := rooms[roomID]
	roomsMu.RUnlock()

	if !exists {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(room)
}

func joinRoomHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	roomID := vars["roomId"]

	var req struct {
		UserID    string `json:"user_id"`
		UserEmail string `json:"user_email"`
		UserName  string `json:"user_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	roomsMu.Lock()
	room, exists := rooms[roomID]
	if !exists {
		roomsMu.Unlock()
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	room.Users[req.UserID] = &User{
		ID:    req.UserID,
		Email: req.UserEmail,
		Name:  req.UserName,
	}
	roomsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(room)
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	client := &Client{Conn: conn}
	clientsMu.Lock()
	clients[conn] = client
	clientsMu.Unlock()

	defer func() {
		clientsMu.Lock()
		delete(clients, conn)
		clientsMu.Unlock()
		conn.Close()
	}()

	for {
		var msg WSMessage
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		handleWSMessage(client, &msg)
	}
}

func handleWSMessage(client *Client, msg *WSMessage) {
	switch msg.Type {
	case "join_room":
		var payload struct {
			RoomID string `json:"room_id"`
			UserID string `json:"user_id"`
		}
		json.Unmarshal(msg.Payload, &payload)
		client.RoomID = payload.RoomID
		client.UserID = payload.UserID
		broadcastToRoom(payload.RoomID, msg)

	case "create_timer":
		var timer Timer
		json.Unmarshal(msg.Payload, &timer)
		timer.ID = generateID()
		timer.CreatedAt = time.Now().Unix()
		timer.IsRunning = false
		timer.ElapsedTime = 0

		roomsMu.Lock()
		if room, exists := rooms[msg.RoomID]; exists {
			room.Timers[timer.ID] = &timer
		}
		roomsMu.Unlock()

		response := WSMessage{
			Type:    "timer_created",
			RoomID:  msg.RoomID,
			TimerID: timer.ID,
			Payload: mustMarshal(timer),
		}
		broadcastToRoom(msg.RoomID, &response)

	case "update_timer":
		var timer Timer
		json.Unmarshal(msg.Payload, &timer)

		roomsMu.Lock()
		if room, exists := rooms[msg.RoomID]; exists {
			if existingTimer, exists := room.Timers[msg.TimerID]; exists {
				existingTimer.Name = timer.Name
				existingTimer.Duration = timer.Duration
				existingTimer.Direction = timer.Direction
				existingTimer.BackgroundColor = timer.BackgroundColor
				existingTimer.TextColor = timer.TextColor
				existingTimer.FontSize = timer.FontSize
			}
		}
		roomsMu.Unlock()

		response := WSMessage{
			Type:    "timer_updated",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
			Payload: msg.Payload,
		}
		broadcastToRoom(msg.RoomID, &response)

	case "start_timer":
		roomsMu.Lock()
		if room, exists := rooms[msg.RoomID]; exists {
			if timer, exists := room.Timers[msg.TimerID]; exists {
				timer.IsRunning = true
			}
		}
		roomsMu.Unlock()

		response := WSMessage{
			Type:    "timer_started",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
		}
		broadcastToRoom(msg.RoomID, &response)

	case "pause_timer":
		roomsMu.Lock()
		if room, exists := rooms[msg.RoomID]; exists {
			if timer, exists := room.Timers[msg.TimerID]; exists {
				timer.IsRunning = false
			}
		}
		roomsMu.Unlock()

		response := WSMessage{
			Type:    "timer_paused",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
		}
		broadcastToRoom(msg.RoomID, &response)

	case "tick_timer":
		var payload struct {
			ElapsedTime int64 `json:"elapsed_time"`
		}
		json.Unmarshal(msg.Payload, &payload)

		roomsMu.Lock()
		if room, exists := rooms[msg.RoomID]; exists {
			if timer, exists := room.Timers[msg.TimerID]; exists {
				timer.ElapsedTime = payload.ElapsedTime
			}
		}
		roomsMu.Unlock()

		response := WSMessage{
			Type:    "timer_tick",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
			Payload: msg.Payload,
		}
		broadcastToRoom(msg.RoomID, &response)

	case "forward_timer":
		var payload struct {
			Seconds int64 `json:"seconds"`
		}
		json.Unmarshal(msg.Payload, &payload)

		roomsMu.Lock()
		if room, exists := rooms[msg.RoomID]; exists {
			if timer, exists := room.Timers[msg.TimerID]; exists {
				timer.ElapsedTime += payload.Seconds
				if timer.ElapsedTime < 0 {
					timer.ElapsedTime = 0
				}
			}
		}
		roomsMu.Unlock()

		response := WSMessage{
			Type:    "timer_forwarded",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
			Payload: msg.Payload,
		}
		broadcastToRoom(msg.RoomID, &response)

	case "backward_timer":
		var payload struct {
			Seconds int64 `json:"seconds"`
		}
		json.Unmarshal(msg.Payload, &payload)

		roomsMu.Lock()
		if room, exists := rooms[msg.RoomID]; exists {
			if timer, exists := room.Timers[msg.TimerID]; exists {
				timer.ElapsedTime -= payload.Seconds
				if timer.ElapsedTime < 0 {
					timer.ElapsedTime = 0
				}
			}
		}
		roomsMu.Unlock()

		response := WSMessage{
			Type:    "timer_backwarded",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
			Payload: msg.Payload,
		}
		broadcastToRoom(msg.RoomID, &response)

	case "delete_timer":
		roomsMu.Lock()
		if room, exists := rooms[msg.RoomID]; exists {
			delete(room.Timers, msg.TimerID)
		}
		roomsMu.Unlock()

		response := WSMessage{
			Type:    "timer_deleted",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
		}
		broadcastToRoom(msg.RoomID, &response)
	}
}

func broadcastToRoom(roomID string, msg *WSMessage) {
	clientsMu.RLock()
	defer clientsMu.RUnlock()

	for _, client := range clients {
		if client.RoomID == roomID {
			client.Conn.WriteJSON(msg)
		}
	}
}

func mustMarshal(v interface{}) json.RawMessage {
	data, _ := json.Marshal(v)
	return data
}

func generateID() string {
	return time.Now().Format("20060102150405") + randomString(6)
}

func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}

func initBuiltInTemplates() {
	builtInTemplates := []TimerTemplate{
		{
			ID:              "pomodoro",
			Name:            "Pomodoro",
			Duration:        1500, // 25 minutes
			Direction:       "backward",
			BackgroundColor: "#ef4444",
			TextColor:       "#ffffff",
			FontSize:        48,
			IsBuiltIn:       true,
		},
		{
			ID:              "short-break",
			Name:            "Short Break",
			Duration:        300, // 5 minutes
			Direction:       "backward",
			BackgroundColor: "#10b981",
			TextColor:       "#ffffff",
			FontSize:        48,
			IsBuiltIn:       true,
		},
		{
			ID:              "long-break",
			Name:            "Long Break",
			Duration:        900, // 15 minutes
			Direction:       "backward",
			BackgroundColor: "#3b82f6",
			TextColor:       "#ffffff",
			FontSize:        48,
			IsBuiltIn:       true,
		},
		{
			ID:              "stopwatch",
			Name:            "Stopwatch",
			Duration:        0,
			Direction:       "forward",
			BackgroundColor: "#8b5cf6",
			TextColor:       "#ffffff",
			FontSize:        48,
			IsBuiltIn:       true,
		},
	}

	templatesMu.Lock()
	defer templatesMu.Unlock()
	for _, tmpl := range builtInTemplates {
		templates[tmpl.ID] = &tmpl
	}
}

func getTemplatesHandler(w http.ResponseWriter, r *http.Request) {
	templatesMu.RLock()
	defer templatesMu.RUnlock()

	templateList := make([]*TimerTemplate, 0, len(templates))
	for _, tmpl := range templates {
		templateList = append(templateList, tmpl)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(templateList)
}

func getUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]

	profilesMu.RLock()
	profile, exists := userProfiles[userID]
	profilesMu.RUnlock()

	if !exists {
		// Return default profile
		profile = &UserProfile{
			DarkMode:     false,
			SoundEnabled: true,
			DefaultTemplate: "pomodoro",
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func updateUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]

	var profile UserProfile
	if err := json.NewDecoder(r.Body).Decode(&profile); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	profilesMu.Lock()
	userProfiles[userID] = &profile
	profilesMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func getTimerHistoryHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]

	historyMu.RLock()
	history, exists := timerHistory[userID]
	historyMu.RUnlock()

	if !exists {
		history = []*TimerHistoryEntry{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(history)
}

func addTimerHistoryHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["userId"]

	var entry TimerHistoryEntry
	if err := json.NewDecoder(r.Body).Decode(&entry); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	entry.ID = generateID()
	entry.UserID = userID
	entry.CompletedAt = time.Now().Unix()

	historyMu.Lock()
	if timerHistory[userID] == nil {
		timerHistory[userID] = []*TimerHistoryEntry{}
	}
	timerHistory[userID] = append(timerHistory[userID], &entry)
	historyMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entry)
}

func joinRoomByInviteHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	inviteCode := vars["inviteCode"]

	var req struct {
		UserID    string `json:"user_id"`
		UserEmail string `json:"user_email"`
		UserName  string `json:"user_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Find room by invite code
	roomsMu.Lock()
	var foundRoom *Room
	for _, room := range rooms {
		if room.InviteCode == inviteCode {
			foundRoom = room
			break
		}
	}

	if foundRoom == nil {
		roomsMu.Unlock()
		http.Error(w, "Invalid invite code", http.StatusNotFound)
		return
	}

	foundRoom.Users[req.UserID] = &User{
		ID:    req.UserID,
		Email: req.UserEmail,
		Name:  req.UserName,
	}
	roomsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(foundRoom)
}
