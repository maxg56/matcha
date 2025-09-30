package main

import (
	"log"
	"net/http"
	"os"

	"media-service/src/conf"
	"media-service/src/handlers"
	"media-service/src/utils"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	conf.ConnectDatabase()

	// Create upload directory if it doesn't exist
	uploadDir := "/app/uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Printf("Warning: Failed to create upload directory: %v", err)
	}

	// Initialize Gin router
	r := gin.Default()

	// Set max multipart memory (16MB)
	r.MaxMultipartMemory = 16 << 20

	// Health check (no auth required)
	r.GET("/health", handlers.HealthCheckHandler)

	// API routes
	api := r.Group("/api/v1")
	{
		media := api.Group("/media")
		{
			// Public routes (no auth required)
			media.GET("/get/:filename", handlers.GetFileHandler)
			media.GET("/uploads/:filename", handlers.ServeUploadHandler) // For compatibility
			media.GET("/user/:user_id", handlers.GetUserMediaHandler)   // Public user media

			// Protected routes (auth required)
			authorized := media.Group("")
			authorized.Use(utils.RequireAuth())
			{
				authorized.POST("/upload", handlers.UploadHandler)
				authorized.DELETE("/delete/:filename", handlers.DeleteFileHandler)
			}
		}
	}

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8006"
	}

	log.Printf("Media service starting on port %s", port)
	log.Printf("Upload directory: %s", uploadDir)

	// Start server
	log.Fatal(http.ListenAndServe(":"+port, r))
}