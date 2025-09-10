package main

import (
    "log"
    "os"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "github.com/gin-contrib/cors"
    
    "github.com/matcha/api/paiements-service/src/stripe"
    "github.com/matcha/api/paiements-service/src/conf"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found, relying on environment variables")
    }

    // Validate required environment variables (only in production)
    if os.Getenv("GIN_MODE") == "release" {
        requiredEnvVars := []string{
            "STRIPE_SECRET_KEY",
            "STRIPE_PRICE_MENSUEL", 
            "STRIPE_PRICE_ANNUEL",
            "STRIPE_WEBHOOK_SECRET",
        }
        
        for _, envVar := range requiredEnvVars {
            if os.Getenv(envVar) == "" {
                log.Fatalf("Required environment variable %s is not set", envVar)
            }
        }
    } else {
        // In development, just warn about missing Stripe keys
        if os.Getenv("STRIPE_SECRET_KEY") == "" || strings.Contains(os.Getenv("STRIPE_SECRET_KEY"), "placeholder") {
            log.Println("WARNING: STRIPE_SECRET_KEY not configured - payment functionality will not work")
        }
    }

    // Initialize database
    conf.InitDB()

    // Set Gin mode based on environment
    if os.Getenv("GIN_MODE") == "release" {
        gin.SetMode(gin.ReleaseMode)
    }

    r := gin.Default()

    // Configure CORS
    frontendURL := os.Getenv("FRONTEND_URL")
    if frontendURL == "" {
        frontendURL = "http://localhost:3000"
    }
    
    allowedOrigins := strings.Split(os.Getenv("CORS_ALLOWED_ORIGINS"), ",")
    if len(allowedOrigins) == 1 && allowedOrigins[0] == "" {
        allowedOrigins = []string{frontendURL, "http://localhost:5173"}
    }

    r.Use(cors.New(cors.Config{
        AllowOrigins:     allowedOrigins,
        AllowMethods:     []string{"POST", "GET", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-User-ID", "X-JWT-Token"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

    // Health check endpoint
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "healthy", "service": "paiements"})
    })

    // Register Stripe routes
    stripe.RegisterRoutes(r)

    port := os.Getenv("PAYOUT_SERVICE_PORT")
    if port == "" {
        port = "8085"
    }

    log.Printf("Payment service running on port %s", port)
    log.Printf("Frontend URL: %s", frontendURL)
    log.Printf("CORS origins: %v", allowedOrigins)
    
    if err := r.Run(":" + port); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}
