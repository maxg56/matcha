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
	media.GET("/get/:filename", proxy.ProxyRequest("media", "/api/v1/media/get/:filename"))
	media.DELETE("/delete/:filename", proxy.ProxyRequest("media", "/api/v1/media/delete/:filename"))

	// Image processing
	media.POST("/resize", proxy.ProxyRequest("media", "/api/v1/media/resize"))

	// User media management
	media.GET("/my", proxy.ProxyRequest("media", "/api/v1/media/my"))
	media.GET("/user/:userId", proxy.ProxyRequest("media", "/api/v1/media/user/:userId"))
	media.POST("/profile", proxy.ProxyRequest("media", "/api/v1/media/profile"))

	// Health check endpoint (without authentication)
	r.GET("/api/media/health", proxy.ProxyRequest("media", "/health"))
}
