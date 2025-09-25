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
		chat.GET("/conversations", proxy.ProxyRequest("chat", "/api/v1/chat/conversations"))
		chat.GET("/conversations/:id", proxy.ProxyRequest("chat", "/api/v1/chat/conversations/:id"))
		chat.PUT("/conversations/:id/read", proxy.ProxyRequest("chat", "/api/v1/chat/conversations/:id/read"))

		chat.GET("/conversations/:id/messages", proxy.ProxyRequest("chat", "/api/v1/chat/conversations/:id/messages"))
		chat.POST("/messages", proxy.ProxyRequest("chat", "/api/v1/chat/messages"))

	} // All chat routes require authentication
	
}
