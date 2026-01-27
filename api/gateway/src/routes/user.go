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
	user.GET("/:id/images", proxy.ProxyRequest("user", "/api/v1/users/:id/images"))
	user.GET("/:id/online-status", proxy.ProxyRequest("user", "/api/v1/users/:id/online-status"))
	
	// Health check endpoint
	user.GET("/", proxy.ProxyRequest("user", "/health"))
	user.GET("/health", proxy.ProxyRequest("user", "/health"))
	
	// Protected routes (authentication required)
	protected := user.Group("")
	protected.Use(middleware.JWTMiddleware())
	{
		// Profile management
		protected.GET("/profile", proxy.ProxyRequest("user", "/api/v1/users/profile"))
		protected.POST("/profile/:id", proxy.ProxyRequest("user", "/api/v1/users/profile/:id"))
		protected.PUT("/profile/:id", proxy.ProxyRequest("user", "/api/v1/users/profile/:id"))
		protected.DELETE("/profile/:id", proxy.ProxyRequest("user", "/api/v1/users/profile/:id"))

		// Location management
		protected.PUT("/:id/location", proxy.ProxyRequest("user", "/api/v1/users/:id/location"))
		protected.GET("/nearby", proxy.ProxyRequest("user", "/api/v1/users/nearby"))

		// Search functionality
		protected.GET("/search", proxy.ProxyRequest("user", "/api/v1/users/search"))

		// Matching preferences
		protected.GET("/:id/preferences", proxy.ProxyRequest("user", "/api/v1/users/:id/preferences"))
		protected.PUT("/:id/preferences", proxy.ProxyRequest("user", "/api/v1/users/:id/preferences"))

		// User setup and initialization
		protected.POST("/setup", proxy.ProxyRequest("user", "/api/v1/users/setup"))
		protected.POST("/:id/initialize-preferences", proxy.ProxyRequest("user", "/api/v1/users/:id/initialize-preferences"))

		// User reporting
		protected.POST("/reports", proxy.ProxyRequest("user", "/api/v1/users/reports"))
		protected.GET("/reports", proxy.ProxyRequest("user", "/api/v1/users/reports"))

		// Profile view tracking
		protected.POST("/profile/:id/view", proxy.ProxyRequest("user", "/api/v1/users/profile/:id/view"))
		protected.GET("/profile/viewers", proxy.ProxyRequest("user", "/api/v1/users/profile/viewers"))
		protected.GET("/profile/views/stats", proxy.ProxyRequest("user", "/api/v1/users/profile/views/stats"))
		protected.GET("/profile/views/history", proxy.ProxyRequest("user", "/api/v1/users/profile/views/history"))

		// Media management
		protected.PUT("/:id/images/order", proxy.ProxyRequest("user", "/api/v1/users/:id/images/order"))
		protected.DELETE("/:id/images/:image_id", proxy.ProxyRequest("user", "/api/v1/users/:id/images/:image_id"))
		protected.PUT("/:id/images/:image_id", proxy.ProxyRequest("user", "/api/v1/users/:id/images/:image_id"))
	}

	// Location API routes (matching frontend expectations)
	location := r.Group("/api/v1/location")
	location.Use(middleware.JWTMiddleware())
	{
		location.GET("/nearby", proxy.ProxyRequest("user", "/api/v1/location/nearby"))
		location.GET("/search", proxy.ProxyRequest("user", "/api/v1/location/search"))
		location.PUT("/location", proxy.ProxyRequest("user", "/api/v1/location/location"))
		location.GET("/location", proxy.ProxyRequest("user", "/api/v1/location/location"))
		location.GET("/reverse-geocode", proxy.ProxyRequest("user", "/api/v1/location/reverse-geocode"))
	}
}
