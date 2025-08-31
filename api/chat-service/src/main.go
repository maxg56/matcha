package main

import (
	"log"
	"net/http"

	"chat-service/src/conf"
	"chat-service/src/handlers"
	"chat-service/src/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("Initializing Chat Service...")

	conf.ConnectDB()
	conf.ConnectRedis()

	r := gin.Default()

	r.GET("/health", handlers.HealthCheck)

	chat := r.Group("/api/v1/chat")
	chat.Use(middleware.AuthMiddleware())
	{
		chat.GET("/ws", handlers.HandleWebSocket)
		chat.GET("/conversations", handlers.GetUserConversations)
		chat.GET("/conversations/:conversationID", handlers.GetConversation)
		chat.POST("/conversations", handlers.CreateConversation)
		chat.GET("/conversations/:conversationID/messages", handlers.GetMessages)
		chat.POST("/conversations/:conversationID/messages", handlers.SendMessage)
		chat.PUT("/conversations/:conversationID/read", handlers.MarkMessagesAsRead)

		chat.GET("/messages/:conversationID", handlers.GetMessages)
		chat.POST("/messages", handlers.SendMessage)
	}

	log.Println("Chat service starting on port 8004")
	log.Fatal(http.ListenAndServe(":8004", r))
}
