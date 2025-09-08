package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"gateway/src/config"
	"gateway/src/handlers"
	"gateway/src/middleware"
	"gateway/src/routes"
	"gateway/src/services"
	"gateway/src/utils"
	"gateway/src/websocket"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Load and validate configuration
	cfg, err := config.LoadAndValidateConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize services configuration
	services.InitServices()

	// Initialize WebSocket manager
	websocket.InitManager()

	// Initialize rate limiter
	if cfg.RateLimitEnabled {
		middleware.InitRateLimiter(cfg.RateLimitRPS)
		log.Printf("Rate limiter initialized: %d RPS per client", cfg.RateLimitRPS)
	}

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
	r.Use(middleware.RateLimitMiddleware())

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
	routes.SetupWebSocketRoutes(r)
	routes.RegisterAdminRoutes(r)

	// Start server
	log.Printf("Gateway starting on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, r))
}
