package routes

import (
	"gateway/src/middleware"
	"gateway/src/proxy"
	"github.com/gin-gonic/gin"
)

// SetupMediaRoutes configures media service routes
func SetupMediaRoutes(r *gin.Engine) {
	media := r.Group("/api/media")
	media.Use(middleware.JWTMiddleware()) // All media routes require authentication

	// File upload and management
	media.POST("/upload", proxy.ProxyRequest("media", "/api/v1/media/upload"))
	media.GET("/:id", proxy.ProxyRequest("media", "/api/v1/media/:id"))
	media.DELETE("/:id", proxy.ProxyRequest("media", "/api/v1/media/:id"))

	// User media retrieval
	media.GET("/user/:userId", proxy.ProxyRequest("media", "/api/v1/media/user/:userId"))

	// Health check endpoint
	media.GET("/", proxy.ProxyRequest("media", "/health"))
}
