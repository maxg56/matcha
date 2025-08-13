package routes

import (
	"gateway/src/middleware"
	"gateway/src/proxy"
	"github.com/gin-gonic/gin"
)

// SetupChatRoutes configures chat service routes
func SetupChatRoutes(r *gin.Engine) {
	chat := r.Group("/api/chat")
	chat.Use(middleware.JWTMiddleware()) // All chat routes require authentication

	// Conversation management
	chat.GET("/conversations", proxy.ProxyRequest("chat", "/api/v1/chat/conversations"))
	chat.GET("/conversations/:id", proxy.ProxyRequest("chat", "/api/v1/chat/conversations/:id"))
	chat.PUT("/conversations/:id/read", proxy.ProxyRequest("chat", "/api/v1/chat/conversations/:id/read"))

	// Message management
	chat.GET("/conversations/:id/messages", proxy.ProxyRequest("chat", "/api/v1/chat/conversations/:id/messages"))
	chat.POST("/conversations/:id/messages", proxy.ProxyRequest("chat", "/api/v1/chat/conversations/:id/messages"))

	// Health check endpoint
	chat.GET("/", proxy.ProxyRequest("chat", "/health"))
}
