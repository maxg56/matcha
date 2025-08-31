package main

import (
	"log"
	"net/http"

	"chat-service/src/conf"
	"chat-service/src/connections"
	"chat-service/src/handlers"
	"chat-service/src/messaging"
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
	connMgr := connections.NewConnectionManager()
	publisher := messaging.NewMessagePublisher(connMgr)
	chatService := services.NewChatService(chatRepo, publisher, connMgr)
	
	// Initialize handlers
	chatHandlers := handlers.NewChatHandlers(chatService)
	
	// Initialize WebSocket hub and start it
	hub := websocket.NewHub(chatService)
	go hub.Run()
	
	// Set global hub for WebSocket handler
	handlers.SetGlobalHub(hub)

	// Setup Gin router
	r := gin.Default()

	// Health check
	r.GET("/health", handlers.HealthCheck)

	// Chat API routes
	chat := r.Group("/api/v1/chat")
	chat.Use(middleware.AuthMiddleware())
	{
		// WebSocket endpoint
		chat.GET("/ws", handlers.HandleWebSocket)
		
		// Conversation endpoints
		chat.GET("/conversations", chatHandlers.GetUserConversations)
		chat.GET("/conversations/:conversationID", chatHandlers.GetConversation)
		chat.POST("/conversations", chatHandlers.CreateConversation)
		
		// Message endpoints
		chat.GET("/conversations/:conversationID/messages", chatHandlers.GetMessages)
		chat.POST("/messages", chatHandlers.SendMessage)
		chat.PUT("/conversations/:conversationID/read", chatHandlers.MarkMessagesAsRead)
	}

	log.Println("✅ Chat service starting on port 8004")
	log.Fatal(http.ListenAndServe(":8004", r))
}