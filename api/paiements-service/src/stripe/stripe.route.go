package stripe

import (
	"github.com/gin-gonic/gin"
	"github.com/matcha/api/paiements-service/src/handlers"
	"github.com/matcha/api/paiements-service/src/middleware"
)

func RegisterRoutes(r *gin.Engine) {
	// Public webhook endpoint (no auth required)
	r.POST("/api/stripe/webhook", handlers.HandleStripeWebhook)

	// Protected routes (require authentication)
	stripeGroup := r.Group("/api/stripe")
	stripeGroup.Use(middleware.AuthMiddleware())
	{
		stripeGroup.POST("/create-checkout-session", handlers.CreateCheckoutSession)
		stripeGroup.GET("/subscription/status", handlers.GetSubscriptionStatus)
	}
}
