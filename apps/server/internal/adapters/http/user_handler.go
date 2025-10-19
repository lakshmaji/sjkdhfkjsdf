package http

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/application"
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/domain"
)

// UserHandler handles HTTP requests for users
type UserHandler struct {
	userService *application.UserService
}

// NewUserHandler creates a new user handler
func NewUserHandler(userService *application.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// GetUserProfile handles GET /api/users/:userId/profile
func (h *UserHandler) GetUserProfile(c echo.Context) error {
	userID := c.Param("userId")

	profile, err := h.userService.GetProfile(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, profile)
}

// UpdateUserProfile handles PUT /api/users/:userId/profile
func (h *UserHandler) UpdateUserProfile(c echo.Context) error {
	userID := c.Param("userId")

	var profile domain.UserProfile
	if err := c.Bind(&profile); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if err := h.userService.UpdateProfile(userID, &profile); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, profile)
}

// GetTimerHistory handles GET /api/users/:userId/history
func (h *UserHandler) GetTimerHistory(c echo.Context) error {
	userID := c.Param("userId")

	history, err := h.userService.GetHistory(userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, history)
}

// AddTimerHistory handles POST /api/users/:userId/history
func (h *UserHandler) AddTimerHistory(c echo.Context) error {
	userID := c.Param("userId")

	var entry domain.TimerHistoryEntry
	if err := c.Bind(&entry); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	entry.UserID = userID

	if err := h.userService.AddHistoryEntry(&entry); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, entry)
}
