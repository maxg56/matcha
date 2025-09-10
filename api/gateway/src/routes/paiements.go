package routes

import (
	"github.com/gin-gonic/gin"
	"gateway/src/proxy"
	"gateway/src/middleware"
)

// SetupPaiementsRoutes configure les routes pour le service paiements
func SetupPaiementsRoutes(r *gin.Engine) {
	// Public webhook endpoint (no auth required)
	r.POST("/api/stripe/webhook", proxy.ProxyRequest("paiements", "/api/stripe/webhook"))

	// Protected routes (require authentication)
	paiements := r.Group("/api/stripe")
	paiements.Use(middleware.JWTMiddleware())
	{
		paiements.POST("/create-checkout-session", proxy.ProxyRequest("paiements", "/api/stripe/create-checkout-session"))
		paiements.GET("/subscription/status", proxy.ProxyRequest("paiements", "/api/stripe/subscription/status"))
	}
}
