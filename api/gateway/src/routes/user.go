package routes

import (
	"gateway/src/middleware"
	"gateway/src/proxy"
	"github.com/gin-gonic/gin"
)

// SetupUserRoutes configures user service routes
func SetupUserRoutes(r *gin.Engine) {
	user := r.Group("/api/users")
	user.Use(middleware.JWTMiddleware()) // All user routes require authentication

	// Profile management
	user.GET("/profile/:id", proxy.ProxyRequest("user", "/api/v1/users/profile/:id"))
	user.PUT("/profile/:id", proxy.ProxyRequest("user", "/api/v1/users/profile/:id"))
	user.DELETE("/profile/:id", proxy.ProxyRequest("user", "/api/v1/users/profile/:id"))

	// User search and discovery
	user.GET("/search", proxy.ProxyRequest("user", "/api/v1/users/search"))

	// Photo management
	user.POST("/upload-photo", proxy.ProxyRequest("user", "/api/v1/users/upload-photo"))

	// Health check endpoint
	user.GET("/", proxy.ProxyRequest("user", "/health"))
}
