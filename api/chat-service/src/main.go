package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "chat-service",
		})
	})

	// Chat routes
	chat := r.Group("/api/v1/chat")
	{
		chat.GET("/ws", websocketHandler)
		chat.GET("/conversations/:userID", getConversationsHandler)
		chat.GET("/messages/:conversationID", getMessagesHandler)
		chat.POST("/messages", sendMessageHandler)
	}

	log.Println("Chat service starting on port 8004")
	log.Fatal(http.ListenAndServe(":8004", r))
}

func websocketHandler(c *gin.Context) {
	// TODO: Implement WebSocket connection logic
	c.JSON(http.StatusOK, gin.H{"message": "WebSocket endpoint"})
}

func getConversationsHandler(c *gin.Context) {
	// TODO: Implement get conversations logic
	c.JSON(http.StatusOK, gin.H{"message": "Get conversations endpoint"})
}

func getMessagesHandler(c *gin.Context) {
	// TODO: Implement get messages logic
	c.JSON(http.StatusOK, gin.H{"message": "Get messages endpoint"})
}

func sendMessageHandler(c *gin.Context) {
	// TODO: Implement send message logic
	c.JSON(http.StatusOK, gin.H{"message": "Send message endpoint"})
}
