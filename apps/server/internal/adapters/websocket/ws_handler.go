package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/application"
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/domain"
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/infrastructure"
)

// WSMessage represents a WebSocket message
type WSMessage struct {
	Type    string          `json:"type"`
	RoomID  string          `json:"room_id,omitempty"`
	TimerID string          `json:"timer_id,omitempty"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

// Client represents a WebSocket client
type Client struct {
	Conn   *websocket.Conn
	UserID string
	RoomID string
}

// WSHandler handles WebSocket connections
type WSHandler struct {
	upgrader     websocket.Upgrader
	clients      map[*websocket.Conn]*Client
	clientsMu    sync.RWMutex
	timerService *application.TimerService
}

// NewWSHandler creates a new WebSocket handler
func NewWSHandler(timerService *application.TimerService) *WSHandler {
	return &WSHandler{
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins for development
			},
		},
		clients:      make(map[*websocket.Conn]*Client),
		timerService: timerService,
	}
}

// HandleWebSocket handles WebSocket connections
func (h *WSHandler) HandleWebSocket(c echo.Context) error {
	ws, err := h.upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return err
	}

	client := &Client{Conn: ws}
	h.clientsMu.Lock()
	h.clients[ws] = client
	h.clientsMu.Unlock()

	defer func() {
		h.clientsMu.Lock()
		delete(h.clients, ws)
		h.clientsMu.Unlock()
		ws.Close()
	}()

	for {
		var msg WSMessage
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		h.handleMessage(client, &msg)
	}

	return nil
}

func (h *WSHandler) handleMessage(client *Client, msg *WSMessage) {
	switch msg.Type {
	case "join_room":
		var payload struct {
			RoomID string `json:"room_id"`
			UserID string `json:"user_id"`
		}
		json.Unmarshal(msg.Payload, &payload)
		client.RoomID = payload.RoomID
		client.UserID = payload.UserID
		h.broadcastToRoom(payload.RoomID, msg)

	case "create_timer":
		var timer domain.Timer
		json.Unmarshal(msg.Payload, &timer)
		timer.ID = infrastructure.GenerateID()
		timer.CreatedAt = time.Now().Unix()
		timer.IsRunning = false
		timer.ElapsedTime = 0

		if err := h.timerService.CreateTimer(msg.RoomID, &timer); err != nil {
			log.Println("Create timer error:", err)
			return
		}

		response := WSMessage{
			Type:    "timer_created",
			RoomID:  msg.RoomID,
			TimerID: timer.ID,
			Payload: mustMarshal(timer),
		}
		h.broadcastToRoom(msg.RoomID, &response)

	case "update_timer":
		var timer domain.Timer
		json.Unmarshal(msg.Payload, &timer)
		timer.ID = msg.TimerID

		existingTimer, err := h.timerService.GetTimer(msg.RoomID, msg.TimerID)
		if err != nil {
			log.Println("Get timer error:", err)
			return
		}

		// Preserve runtime state
		timer.IsRunning = existingTimer.IsRunning
		timer.ElapsedTime = existingTimer.ElapsedTime
		timer.CreatedAt = existingTimer.CreatedAt

		if err := h.timerService.UpdateTimer(msg.RoomID, &timer); err != nil {
			log.Println("Update timer error:", err)
			return
		}

		response := WSMessage{
			Type:    "timer_updated",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
			Payload: mustMarshal(timer),
		}
		h.broadcastToRoom(msg.RoomID, &response)

	case "start_timer":
		timer, err := h.timerService.GetTimer(msg.RoomID, msg.TimerID)
		if err != nil {
			log.Println("Get timer error:", err)
			return
		}

		timer.IsRunning = true
		if err := h.timerService.UpdateTimer(msg.RoomID, timer); err != nil {
			log.Println("Update timer error:", err)
			return
		}

		response := WSMessage{
			Type:    "timer_started",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
		}
		h.broadcastToRoom(msg.RoomID, &response)

	case "pause_timer":
		timer, err := h.timerService.GetTimer(msg.RoomID, msg.TimerID)
		if err != nil {
			log.Println("Get timer error:", err)
			return
		}

		timer.IsRunning = false
		if err := h.timerService.UpdateTimer(msg.RoomID, timer); err != nil {
			log.Println("Update timer error:", err)
			return
		}

		response := WSMessage{
			Type:    "timer_paused",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
		}
		h.broadcastToRoom(msg.RoomID, &response)

	case "tick_timer":
		var payload struct {
			ElapsedTime int64 `json:"elapsed_time"`
		}
		json.Unmarshal(msg.Payload, &payload)

		timer, err := h.timerService.GetTimer(msg.RoomID, msg.TimerID)
		if err != nil {
			log.Println("Get timer error:", err)
			return
		}

		timer.ElapsedTime = payload.ElapsedTime
		if err := h.timerService.UpdateTimer(msg.RoomID, timer); err != nil {
			log.Println("Update timer error:", err)
			return
		}

		response := WSMessage{
			Type:    "timer_tick",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
			Payload: msg.Payload,
		}
		h.broadcastToRoom(msg.RoomID, &response)

	case "forward_timer":
		var payload struct {
			Seconds int64 `json:"seconds"`
		}
		json.Unmarshal(msg.Payload, &payload)

		timer, err := h.timerService.GetTimer(msg.RoomID, msg.TimerID)
		if err != nil {
			log.Println("Get timer error:", err)
			return
		}

		timer.ElapsedTime += payload.Seconds
		if timer.ElapsedTime < 0 {
			timer.ElapsedTime = 0
		}
		if err := h.timerService.UpdateTimer(msg.RoomID, timer); err != nil {
			log.Println("Update timer error:", err)
			return
		}

		response := WSMessage{
			Type:    "timer_forwarded",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
			Payload: msg.Payload,
		}
		h.broadcastToRoom(msg.RoomID, &response)

	case "backward_timer":
		var payload struct {
			Seconds int64 `json:"seconds"`
		}
		json.Unmarshal(msg.Payload, &payload)

		timer, err := h.timerService.GetTimer(msg.RoomID, msg.TimerID)
		if err != nil {
			log.Println("Get timer error:", err)
			return
		}

		timer.ElapsedTime -= payload.Seconds
		if timer.ElapsedTime < 0 {
			timer.ElapsedTime = 0
		}
		if err := h.timerService.UpdateTimer(msg.RoomID, timer); err != nil {
			log.Println("Update timer error:", err)
			return
		}

		response := WSMessage{
			Type:    "timer_backwarded",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
			Payload: msg.Payload,
		}
		h.broadcastToRoom(msg.RoomID, &response)

	case "delete_timer":
		if err := h.timerService.DeleteTimer(msg.RoomID, msg.TimerID); err != nil {
			log.Println("Delete timer error:", err)
			return
		}

		response := WSMessage{
			Type:    "timer_deleted",
			RoomID:  msg.RoomID,
			TimerID: msg.TimerID,
		}
		h.broadcastToRoom(msg.RoomID, &response)
	}
}

func (h *WSHandler) broadcastToRoom(roomID string, msg *WSMessage) {
	h.clientsMu.RLock()
	defer h.clientsMu.RUnlock()

	for _, client := range h.clients {
		if client.RoomID == roomID {
			client.Conn.WriteJSON(msg)
		}
	}
}

func mustMarshal(v interface{}) json.RawMessage {
	data, _ := json.Marshal(v)
	return data
}
