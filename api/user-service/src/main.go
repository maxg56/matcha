package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"user-service/src/conf"
	"user-service/src/handlers"
	"user-service/src/middleware"
)

func main() {
	// Initialize database
	conf.InitDB()

	r := gin.Default()

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "user-service",
		})
	})

	// User routes
	users := r.Group("/api/v1/users")
	{
		// Public routes
		users.GET("/profile/:id", handlers.GetProfileHandler)
		users.GET("/:id/images", handlers.GetUserImagesHandler)

		// Protected routes
		protected := users.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// Profile management
			protected.GET("/profile", handlers.GetOwnProfileHandler)
			protected.POST("/profile/:id", handlers.UpdateProfileHandler)
			protected.PUT("/profile/:id", handlers.UpdateProfileHandler)
			protected.DELETE("/profile/:id", handlers.DeleteProfileHandler)

			// Location management
			protected.PUT("/:id/location", handlers.UpdateLocationHandler)
			protected.GET("/nearby", handlers.GetMatchedUsersHandler)

			// Search functionality
			protected.GET("/search", handlers.SearchUsersHandler)

			// Matching preferences
			protected.GET("/:id/preferences", handlers.GetPreferencesHandler)
			protected.PUT("/:id/preferences", handlers.UpdatePreferencesHandler)

			// User setup and initialization
			protected.POST("/setup", handlers.SetupNewUserHandler)
			protected.POST("/:id/initialize-preferences", handlers.InitializeUserPreferencesHandler)

			// User reporting
			protected.POST("/reports", handlers.CreateReportHandler)
			protected.GET("/reports", handlers.GetUserReportsHandler)

			// Profile view tracking
			protected.POST("/profile/:id/view", handlers.TrackProfileViewHandler)
			protected.GET("/profile/viewers", handlers.GetProfileViewersHandler)
			protected.GET("/profile/views/stats", handlers.GetProfileViewStatsHandler)
			protected.GET("/profile/views/history", handlers.GetMyProfileViewsHandler)

			// Media management
			protected.PUT("/:id/images/order", handlers.UpdateImageOrderHandler)
			protected.DELETE("/:id/images/:image_id", handlers.DeleteImageHandler)
			protected.PUT("/:id/images/:image_id", handlers.UpdateImageDetailsHandler)
		}
	}

	// Location API routes (matching frontend expectations)
	location := r.Group("/api/v1/location")
	location.Use(middleware.AuthMiddleware())
	{
		location.GET("/nearby", handlers.GetMatchedUsersHandler) // Now returns only matched users
		location.GET("/search", handlers.SearchUsersHandler)
		location.PUT("/location", handlers.UpdateLocationHandler)
		location.GET("/location", handlers.GetCurrentLocationHandler)
	}

	log.Println("User service starting on port 8002")
	log.Fatal(http.ListenAndServe(":8002", r))
}
