package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"gateway/src/handlers"
	"gateway/src/routes"
	"gateway/src/services"
	"gateway/src/utils"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using default values")
	}

	// Initialize services configuration
	services.InitServices()

	// Initialize Redis for JWT blacklisting
	if err := utils.InitRedis(); err != nil {
		log.Printf("Failed to initialize Redis: %v", err)
		log.Println("Redis initialization failed - JWT blacklisting will be disabled")
	} else {
		log.Println("Redis initialized successfully for JWT blacklisting")
	}

	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()

	// Global middlewares
	r.Use(gin.Recovery())
	r.Use(gin.Logger())
	r.Use(handlers.CORSMiddleware())

	// Health check endpoints
	r.GET("/health", handlers.HealthCheck)
	r.GET("/api/health", handlers.HealthCheck)

	// Setup service routes
	routes.SetupAuthRoutes(r)
	routes.SetupUserRoutes(r)
	routes.SetupMediaRoutes(r)
	routes.SetupMatchRoutes(r)
	routes.SetupChatRoutes(r)
	routes.SetupNotifyRoutes(r)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Gateway starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
