package routes

import (
	"gateway/src/middleware"
	"gateway/src/proxy"
	"github.com/gin-gonic/gin"
)

// SetupNotifyRoutes configures notification service routes
func SetupNotifyRoutes(r *gin.Engine) {
	notify := r.Group("/api/notifications")
	notify.Use(middleware.JWTMiddleware()) // All notification routes require authentication

	// Notification retrieval
	notify.GET("/list", proxy.ProxyRequest("notify", "/api/v1/notifications"))
	notify.GET("/stream/:user_id", proxy.ProxyRequest("notify", "/api/v1/notifications/stream/:user_id"))

	// Notification management
	notify.PUT("/:id/read", proxy.ProxyRequest("notify", "/api/v1/notifications/:id/read"))
	notify.DELETE("/:id", proxy.ProxyRequest("notify", "/api/v1/notifications/:id"))
	notify.PUT("/read-all", proxy.ProxyRequest("notify", "/api/v1/notifications/read-all"))

	// Health check endpoint
	notify.GET("/", proxy.ProxyRequest("notify", "/health"))
}
