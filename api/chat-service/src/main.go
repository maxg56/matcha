package main

import (
	"log"
	"net/http"

	"chat-service/src/conf"
	"chat-service/src/handlers"
	"chat-service/src/middleware"
	"chat-service/src/repository"
	"chat-service/src/services"
	"chat-service/src/websocket"

	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("🚀 Initializing Chat Service...")

	// Initialize database and Redis
	conf.ConnectDB()
	conf.ConnectRedis()

	// Initialize dependencies with interfaces
	chatRepo := repository.NewChatRepository(conf.DB)
	
	// Initialize WebSocket hub first
	hub := websocket.NewHub(nil, chatRepo) // Will set chatService after creation
	go hub.Run()

	// Initialize chat service with hub as connection manager
	chatService := services.NewChatService(chatRepo, hub)
	
	// Update hub with chat service
	hub.SetChatService(chatService)
	
	// Initialize handlers
	chatHandlers := handlers.NewChatHandlers(chatService)
	
	// Set global hub for WebSocket handler
	handlers.SetGlobalHub(hub)

	// Setup Gin router
	r := gin.Default()

	// Health check
	r.GET("/health", handlers.HealthCheck)

	// Monitoring routes
	r.GET("/stats", handlers.GetConnectionStats)
	r.GET("/stats/detailed", handlers.GetDetailedStats)

	// Chat API routes
	chat := r.Group("/api/v1/chat")

	// Gateway WebSocket endpoint (no auth middleware - gateway handles auth)
	chat.GET("/gateway-ws", handlers.HandleGatewayWebSocket)

	chat.Use(middleware.AuthMiddleware())
	{
		// Regular WebSocket endpoint
		chat.GET("/ws", handlers.HandleWebSocket)

		// Conversation endpoints
		chat.GET("/conversations", chatHandlers.GetUserConversations)
		chat.GET("/conversations/:conversationID", chatHandlers.GetConversation)
		chat.POST("/conversations", chatHandlers.CreateConversation)
		chat.DELETE("/conversations", chatHandlers.DeleteConversation)

		// Message endpoints
		chat.GET("/conversations/:conversationID/messages", chatHandlers.GetMessages)
		chat.POST("/messages", chatHandlers.SendMessage)
		chat.PUT("/conversations/:conversationID/read", chatHandlers.MarkMessagesAsRead)

		// Reaction endpoints
		chat.POST("/reactions", chatHandlers.AddReaction)
		chat.DELETE("/messages/:messageID/reactions/:emoji", chatHandlers.RemoveReaction)
		chat.GET("/messages/:messageID/reactions", chatHandlers.GetMessageReactions)

		// User presence endpoints
		chat.PUT("/presence/online", chatHandlers.SetUserOnline)
		chat.PUT("/presence/offline", chatHandlers.SetUserOffline)
		chat.GET("/users/:userID/presence", chatHandlers.GetUserPresence)
	}

	log.Println("✅ Chat service starting on port 8004")
	log.Fatal(http.ListenAndServe(":8004", r))
}