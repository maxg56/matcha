package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load env
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using default values")
	}

	// Initialize services configuration
	initServices()

	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()

	// Middlewares
	r.Use(gin.Recovery())
	r.Use(gin.Logger())
	r.Use(corsMiddleware())

	// Health check
	r.GET("/health", healthCheck)
	r.GET("/api/health", healthCheck)

	// Setup service routes
	setupAuthRoutes(r)
	setupUserRoutes(r)
	setupMediaRoutes(r)
	setupMatchRoutes(r)
	setupChatRoutes(r)
	setupNotifyRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Gateway starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
