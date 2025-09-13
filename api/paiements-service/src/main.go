package main

import (
    "log"

    "github.com/gin-gonic/gin"
    "github.com/matcha/api/paiements-service/src/handlers"
    "github.com/matcha/api/paiements-service/src/conf"
    "github.com/matcha/api/paiements-service/src/middleware"
)

func main() {
    // Initialize environment configuration
    conf.InitEnv()

    // Initialize database
    conf.InitDB()

    // Set Gin mode based on environment
    if conf.Env.IsProduction() {
        gin.SetMode(gin.ReleaseMode)
    }

    r := gin.Default()

    // Configure trusted proxies for security
    if conf.Env.IsProduction() {
        r.SetTrustedProxies([]string{"127.0.0.1"}) // Only trust localhost in production
    } else {
        r.SetTrustedProxies([]string{"127.0.0.1", "172.16.0.0/12", "192.168.0.0/16"}) // Docker networks
    }


    // Health check endpoint
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "healthy", "service": "paiements"})
    })

    // Register Stripe routes
    r.POST("/api/stripe/webhook", handlers.HandleStripeWebhook)
	
	// Test endpoint (no auth required) - remove in production
	r.GET("/api/stripe/test", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"success": true,
			"message": "Payment service is working",
			"data": gin.H{
				"service": "paiements-service",
				"version": "2.0",
				"endpoints": []string{
					"POST /api/stripe/create-checkout-session",
					"GET /api/stripe/subscription/status",
					"POST /api/stripe/webhook",
				},
			},
		})
	})

	// Protected routes (require authentication)
	stripeGroup := r.Group("/api/stripe")
	stripeGroup.Use(middleware.AuthMiddleware())
	{
		stripeGroup.POST("/create-checkout-session", handlers.CreateCheckoutSession)
		stripeGroup.GET("/subscription/status", handlers.GetSubscriptionStatus)
	}

    log.Printf("🚀 Payment service running on port %s (mode: %s)", conf.Env.Port, conf.Env.GinMode)

    if err := r.Run(":" + conf.Env.Port); err != nil {
        log.Fatalf("❌ Failed to start server: %v", err)
    }
}
