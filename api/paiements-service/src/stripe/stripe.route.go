package stripe

import (
	"github.com/gin-gonic/gin"
	"github.com/matcha/api/paiements-service/src/handlers"
	"github.com/matcha/api/paiements-service/src/middleware"
)

func RegisterRoutes(r *gin.Engine) {
	// Public webhook endpoint (no auth required)
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
}
