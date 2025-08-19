package routes

import (
	"gateway/src/middleware"
	"gateway/src/proxy"
	"github.com/gin-gonic/gin"
)

// SetupAuthRoutes configures authentication service routes
func SetupAuthRoutes(r *gin.Engine) {
	auth := r.Group("/api/v1/auth")

	// Public routes (no authentication required)
	auth.POST("/register", proxy.ProxyRequest("auth", "/api/v1/auth/register"))
	auth.POST("/login", proxy.ProxyRequest("auth", "/api/v1/auth/login"))
	auth.POST("/refresh", proxy.ProxyRequest("auth", "/api/v1/auth/refresh"))
	auth.POST("/forgot-password", proxy.ProxyRequest("auth", "/api/v1/auth/forgot-password"))
	auth.POST("/reset-password", proxy.ProxyRequest("auth", "/api/v1/auth/reset-password"))
	auth.POST("/check-availability", proxy.ProxyRequest("auth", "/api/v1/auth/check-availability"))

	// Protected routes (authentication required)
	protected := auth.Group("")
	protected.Use(middleware.JWTMiddleware())
	{
		protected.POST("/logout", proxy.ProxyRequest("auth", "/api/v1/auth/logout"))
		protected.GET("/verify", proxy.ProxyRequest("auth", "/api/v1/auth/verify"))
	}

	// Health check endpoint
	auth.GET("/", proxy.ProxyRequest("auth", "/health"))
}
