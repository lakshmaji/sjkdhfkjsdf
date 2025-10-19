package http

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/application"
)

// RoomHandler handles HTTP requests for rooms
type RoomHandler struct {
	roomService *application.RoomService
}

// NewRoomHandler creates a new room handler
func NewRoomHandler(roomService *application.RoomService) *RoomHandler {
	return &RoomHandler{
		roomService: roomService,
	}
}

// CreateRoom handles POST /api/rooms
func (h *RoomHandler) CreateRoom(c echo.Context) error {
	var req struct {
		Name      string `json:"name"`
		UserID    string `json:"user_id"`
		UserEmail string `json:"user_email"`
		UserName  string `json:"user_name"`
	}

	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	room, err := h.roomService.CreateRoom(req.Name, req.UserID, req.UserEmail, req.UserName)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, room)
}

// ListRooms handles GET /api/rooms
func (h *RoomHandler) ListRooms(c echo.Context) error {
	rooms, err := h.roomService.ListRooms()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, rooms)
}

// GetRoom handles GET /api/rooms/:roomId
func (h *RoomHandler) GetRoom(c echo.Context) error {
	roomID := c.Param("roomId")

	room, err := h.roomService.GetRoom(roomID)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, room)
}

// JoinRoom handles POST /api/rooms/:roomId/join
func (h *RoomHandler) JoinRoom(c echo.Context) error {
	roomID := c.Param("roomId")

	var req struct {
		UserID    string `json:"user_id"`
		UserEmail string `json:"user_email"`
		UserName  string `json:"user_name"`
	}

	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	room, err := h.roomService.JoinRoom(roomID, req.UserID, req.UserEmail, req.UserName)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, room)
}

// JoinRoomByInvite handles POST /api/rooms/invite/:inviteCode
func (h *RoomHandler) JoinRoomByInvite(c echo.Context) error {
	inviteCode := c.Param("inviteCode")

	var req struct {
		UserID    string `json:"user_id"`
		UserEmail string `json:"user_email"`
		UserName  string `json:"user_name"`
	}

	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	room, err := h.roomService.JoinRoomByInvite(inviteCode, req.UserID, req.UserEmail, req.UserName)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, room)
}
