package routes

import (
	"gateway/src/middleware"
	"gateway/src/proxy"
	"github.com/gin-gonic/gin"
)

// SetupNotifyRoutes configures notification service routes
func SetupNotifyRoutes(r *gin.Engine) {
	notify := r.Group("/api/v1/notifications")
	
	// Health check endpoint
	notify.GET("/", proxy.ProxyRequest("notify", "/health"))
	notify.GET("/health", proxy.ProxyRequest("notify", "/health"))


	// WebSocket notifications (route à la racine, pas dans /api/v1/notifications)
  r.GET("/ws/notifications", proxy.ProxyWebSocket("notify", "/ws/notifications"))

	// Notification management
	protected := notify.Group("")
	protected.Use(middleware.JWTMiddleware())
	{
	// Notification retrieval
		protected.GET("/delete", proxy.ProxyRequest("notify", "/delete"))
	}
}
