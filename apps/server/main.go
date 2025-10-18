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
}

type Room struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	CreatedBy   string           `json:"created_by"`
	Users       map[string]*User `json:"users"`
	Timers      map[string]*Timer `json:"timers"`
	mu          sync.RWMutex
}

type Timer struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	Duration       int64   `json:"duration"`        // in seconds
	ElapsedTime    int64   `json:"elapsed_time"`    // in seconds
	IsRunning      bool    `json:"is_running"`
	Direction      string  `json:"direction"`       // "forward" or "backward"
	CreatedAt      int64   `json:"created_at"`
	BackgroundColor string `json:"background_color"`
	TextColor      string  `json:"text_color"`
	FontSize       int     `json:"font_size"`
}

type WSMessage struct {
	Type    string          `json:"type"`
	RoomID  string          `json:"room_id,omitempty"`
	TimerID string          `json:"timer_id,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

// Global state
var (
	rooms     = make(map[string]*Room)
	roomsMu   sync.RWMutex
	upgrader  = websocket.Upgrader{
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

	router := mux.NewRouter()

	// REST API endpoints
	router.HandleFunc("/health", healthHandler).Methods("GET")
	router.HandleFunc("/api/rooms", createRoomHandler).Methods("POST")
	router.HandleFunc("/api/rooms", listRoomsHandler).Methods("GET")
	router.HandleFunc("/api/rooms/{roomId}", getRoomHandler).Methods("GET")
	router.HandleFunc("/api/rooms/{roomId}/join", joinRoomHandler).Methods("POST")

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
	room := &Room{
		ID:        roomID,
		Name:      req.Name,
		CreatedBy: req.UserID,
		Users:     make(map[string]*User),
		Timers:    make(map[string]*Timer),
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
