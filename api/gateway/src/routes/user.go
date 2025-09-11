package routes

import (
	"gateway/src/middleware"
	"gateway/src/proxy"
	"github.com/gin-gonic/gin"
)

// SetupUserRoutes configures user service routes
func SetupUserRoutes(r *gin.Engine) {
	user := r.Group("/api/v1/users")

	// Public routes
	user.GET("/profile/:id", proxy.ProxyRequest("user", "/api/v1/users/profile/:id"))
	// Health check endpoint
	user.GET("/", proxy.ProxyRequest("user", "/health"))
	user.GET("/health", proxy.ProxyRequest("user", "/health"))
	// Protected routes (authentication required)
	protected := user.Group("")
	protected.Use(middleware.JWTMiddleware())
	{
		// Current user profile (no ID needed, uses JWT token)
		protected.GET("/profile", proxy.ProxyRequest("user", "/api/v1/users/profile"))
		protected.POST("/profile/:id", proxy.ProxyRequest("user", "/api/v1/users/profile/:id"))
		protected.PUT("/profile/:id", proxy.ProxyRequest("user", "/api/v1/users/profile/:id"))
		protected.DELETE("/profile/:id", proxy.ProxyRequest("user", "/api/v1/users/profile/:id"))
	}

}
