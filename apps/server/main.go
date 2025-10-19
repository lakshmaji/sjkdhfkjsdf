package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/adapters/http"
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/adapters/websocket"
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/application"
	"github.com/lakshmaji/sjkdhfkjsdf/apps/server/internal/infrastructure"
)

func main() {
	// Load environment variables
	godotenv.Load()

	// Initialize Echo
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
	}))

	// Initialize repositories (infrastructure layer)
	roomRepo := infrastructure.NewMemoryRoomRepository()
	timerRepo := infrastructure.NewMemoryTimerRepository(roomRepo)
	templateRepo := infrastructure.NewMemoryTemplateRepository()
	profileRepo := infrastructure.NewMemoryUserProfileRepository()
	historyRepo := infrastructure.NewMemoryHistoryRepository()

	// Initialize services (application layer)
	roomService := application.NewRoomService(roomRepo)
	timerService := application.NewTimerService(timerRepo)
	templateService := application.NewTemplateService(templateRepo)
	userService := application.NewUserService(profileRepo, historyRepo)

	// Initialize handlers (adapters layer)
	healthHandler := http.NewHealthHandler()
	roomHandler := http.NewRoomHandler(roomService)
	templateHandler := http.NewTemplateHandler(templateService)
	userHandler := http.NewUserHandler(userService)
	wsHandler := websocket.NewWSHandler(timerService)

	// Health check
	e.GET("/health", healthHandler.Health)

	// Room endpoints
	e.POST("/api/rooms", roomHandler.CreateRoom)
	e.GET("/api/rooms", roomHandler.ListRooms)
	e.GET("/api/rooms/:roomId", roomHandler.GetRoom)
	e.POST("/api/rooms/:roomId/join", roomHandler.JoinRoom)
	e.POST("/api/rooms/invite/:inviteCode", roomHandler.JoinRoomByInvite)

	// Template endpoints
	e.GET("/api/templates", templateHandler.GetTemplates)

	// User endpoints
	e.GET("/api/users/:userId/profile", userHandler.GetUserProfile)
	e.PUT("/api/users/:userId/profile", userHandler.UpdateUserProfile)
	e.GET("/api/users/:userId/history", userHandler.GetTimerHistory)
	e.POST("/api/users/:userId/history", userHandler.AddTimerHistory)

	// WebSocket endpoint
	e.GET("/ws", wsHandler.HandleWebSocket)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := e.Start(":" + port); err != nil {
		log.Fatal("Server error:", err)
	}
}
