package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/matcha/api/paiements-service/src/handlers"
	"github.com/matcha/api/paiements-service/src/middleware"
)

// SetupRoutes configure toutes les routes du service paiements
func SetupRoutes(r *gin.Engine) {
	// Initialiser les handlers
	healthHandler := handlers.NewHealthHandler()
	webhookHandler := handlers.NewWebhookHandler()
	subscriptionHandler := handlers.NewSubscriptionHandler()
	paymentHandler := handlers.NewPaymentHandler()

	// Routes de santé (non protégées)
	health := r.Group("/health")
	{
		health.GET("/", healthHandler.HealthCheck)
		health.GET("/ready", healthHandler.ReadinessCheck)
		health.GET("/live", healthHandler.LivenessCheck)
	}

	// Routes publiques pour Stripe
	public := r.Group("/api/stripe")
	{
		// Webhook Stripe (doit être public pour recevoir les événements)
		public.POST("/webhook", webhookHandler.HandleStripeWebhook)

		// Endpoint legacy pour créer une session de checkout
		stripeController := handlers.NewStripeController()
		public.POST("/create-checkout-session", stripeController.CreateCheckoutSession)

		// Test webhook (pour les tests de développement)
		public.POST("/test-webhook", webhookHandler.TestWebhook)
	}

	// Routes protégées (nécessitent JWT)
	protected := r.Group("/api/stripe")
	protected.Use(middleware.JWTMiddleware())
	{
		// Gestion des abonnements
		subscription := protected.Group("/subscription")
		{
			subscription.GET("", subscriptionHandler.GetSubscription)
			subscription.GET("/", subscriptionHandler.GetSubscription)
			subscription.POST("", subscriptionHandler.CreateSubscription)
			subscription.POST("/", subscriptionHandler.CreateSubscription)
			subscription.DELETE("", subscriptionHandler.CancelSubscription)
			subscription.DELETE("/", subscriptionHandler.CancelSubscription)
			subscription.GET("/billing-portal", subscriptionHandler.GetBillingPortal)
			subscription.GET("/premium-status", subscriptionHandler.CheckPremiumStatus)
		}

		// Gestion des paiements
		payment := protected.Group("/payment")
		{
			payment.GET("/history", paymentHandler.GetPaymentHistory)
			payment.GET("/stats", paymentHandler.GetPaymentStats)
			payment.POST("/test", paymentHandler.CreateTestPayment) // Endpoint pour créer des paiements de test
		}
	}

	// Routes d'administration (nécessitent une clé API interne)
	admin := r.Group("/api/admin")
	admin.Use(middleware.AdminMiddleware())
	{
		// Gestion des webhooks
		webhook := admin.Group("/webhook")
		{
			webhook.GET("/events", webhookHandler.GetWebhookEvents)
			webhook.POST("/retry", webhookHandler.RetryFailedEvents)
		}

		// Gestion des paiements
		payment := admin.Group("/payment")
		{
			payment.POST("/sync", paymentHandler.SyncPayments)                     // Synchroniser tous les paiements
			payment.POST("/sync/:user_id", paymentHandler.SyncUserPayments)       // Synchroniser les paiements d'un utilisateur
		}
	}
}