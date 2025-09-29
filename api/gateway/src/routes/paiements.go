package routes

import (
	"github.com/gin-gonic/gin"
	"gateway/src/proxy"
	"gateway/src/middleware"
)

// SetupPaiementsRoutes configure les routes pour le service paiements
func SetupPaiementsRoutes(r *gin.Engine) {
	// Routes publiques Stripe (webhooks et checkout)
	public := r.Group("/api/stripe")
	{
		// Webhooks Stripe - DOIT rester public pour recevoir les événements de Stripe
		public.POST("/webhook", proxy.ProxyRequest("paiements", "/api/stripe/webhook"))

		// Création de session checkout - public pour simplicité (la sécurité est dans le service)
		public.POST("/create-checkout-session", proxy.ProxyRequest("paiements", "/api/stripe/create-checkout-session"))

		// Test webhook (pour développement)
		public.POST("/test-webhook", proxy.ProxyRequest("paiements", "/api/stripe/test-webhook"))
	}

	// Routes publiques Stripe avec préfixe v1 (pour compatibilité Stripe)
	publicV1 := r.Group("/api/v1/stripe")
	{
		// Webhooks Stripe - Route alternative avec préfixe v1
		publicV1.POST("/webhook", proxy.ProxyRequest("paiements", "/api/stripe/webhook"))

		// Autres routes v1 si nécessaire
		publicV1.POST("/create-checkout-session", proxy.ProxyRequest("paiements", "/api/stripe/create-checkout-session"))
	}

	// Routes protégées par JWT
	protected := r.Group("/api/stripe")
	protected.Use(middleware.JWTMiddleware())
	{
		// Gestion des abonnements
		subscription := protected.Group("/subscription")
		{
			subscription.GET("/", proxy.ProxyRequest("paiements", "/api/stripe/subscription"))
			subscription.POST("/", proxy.ProxyRequest("paiements", "/api/stripe/subscription"))
			subscription.DELETE("/", proxy.ProxyRequest("paiements", "/api/stripe/subscription"))
			subscription.GET("/billing-portal", proxy.ProxyRequest("paiements", "/api/stripe/subscription/billing-portal"))
		}

		// Gestion des paiements
		payment := protected.Group("/payment")
		{
			payment.GET("/history", proxy.ProxyRequest("paiements", "/api/stripe/payment/history"))
			payment.GET("/stats", proxy.ProxyRequest("paiements", "/api/stripe/payment/stats"))
		}
	}

	// Routes d'administration (avec JWT admin - à implémenter plus tard si nécessaire)
	// admin := r.Group("/api/admin")
	// admin.Use(middleware.JWTMiddleware()) // Utiliser JWT pour l'instant
	// {
	// 	webhook := admin.Group("/webhook")
	// 	{
	// 		webhook.GET("/events", proxy.ProxyRequest("paiements-service", "/api/admin/webhook/events"))
	// 		webhook.POST("/retry", proxy.ProxyRequest("paiements-service", "/api/admin/webhook/retry"))
	// 	}
	// }

	// Routes de santé du service paiements
	health := r.Group("/api/paiements")
	{
		health.GET("/health", proxy.ProxyRequest("paiements", "/health"))
		health.GET("/health/ready", proxy.ProxyRequest("paiements", "/health/ready"))
		health.GET("/health/live", proxy.ProxyRequest("paiements", "/health/live"))
	}
}
