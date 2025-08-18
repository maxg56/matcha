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

		// Protected routes
		protected := users.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.POST("/profile/:id", handlers.UpdateProfileHandler)
			protected.PUT("/profile/:id", handlers.UpdateProfileHandler)
			protected.DELETE("/profile/:id", handlers.DeleteProfileHandler)
		}
	}

	log.Println("User service starting on port 8002")
	log.Fatal(http.ListenAndServe(":8002", r))
}
