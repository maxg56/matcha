package routes

import (
	"gateway/src/middleware"
	"gateway/src/proxy"
	"github.com/gin-gonic/gin"
)

// SetupChatRoutes configures chat service routes
func SetupChatRoutes(r *gin.Engine) {
	chat := r.Group("/api/v1/chat")
	chat.GET("/", proxy.ProxyRequest("chat", "/health"))
	chat.GET("/health", proxy.ProxyRequest("chat", "/health"))

	// WebSocket chat maintenant géré par la route unifiée /ws

	chat.Use(middleware.JWTMiddleware())
	{
		// Conversation endpoints
		chat.GET("/conversations", proxy.ProxyRequest("chat", "/api/v1/chat/conversations"))
		chat.GET("/conversations/:id", proxy.ProxyRequest("chat", "/api/v1/chat/conversations/:id"))
		chat.POST("/conversations", proxy.ProxyRequest("chat", "/api/v1/chat/conversations"))
		chat.PUT("/conversations/:id/read", proxy.ProxyRequest("chat", "/api/v1/chat/conversations/:id/read"))

		// Message endpoints
		chat.GET("/conversations/:id/messages", proxy.ProxyRequest("chat", "/api/v1/chat/conversations/:id/messages"))
		chat.POST("/messages", proxy.ProxyRequest("chat", "/api/v1/chat/messages"))

		// Reaction endpoints
		chat.POST("/reactions", proxy.ProxyRequest("chat", "/api/v1/chat/reactions"))
		chat.DELETE("/messages/:messageID/reactions/:emoji", proxy.ProxyRequest("chat", "/api/v1/chat/messages/:messageID/reactions/:emoji"))
		chat.GET("/messages/:messageID/reactions", proxy.ProxyRequest("chat", "/api/v1/chat/messages/:messageID/reactions"))

		// User presence endpoints
		chat.PUT("/presence/online", proxy.ProxyRequest("chat", "/api/v1/chat/presence/online"))
		chat.PUT("/presence/offline", proxy.ProxyRequest("chat", "/api/v1/chat/presence/offline"))
		chat.GET("/users/:userID/presence", proxy.ProxyRequest("chat", "/api/v1/chat/users/:userID/presence"))

	} // All chat routes require authentication
	
}
