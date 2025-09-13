package routes

import (
	"github.com/gin-gonic/gin"
	"gateway/src/proxy"
	"gateway/src/middleware"
)

// SetupPaiementsRoutes configure les routes pour le service paiements
func SetupPaiementsRoutes(r *gin.Engine) {
	// Public endpoints (no auth required)
	r.POST("/api/v1/stripe/webhook", proxy.ProxyRequest("paiements", "/api/stripe/webhook"))
	r.GET("/api/v1/stripe/test", proxy.ProxyRequest("paiements", "/api/stripe/test"))

	// Protected routes (require authentication)
	paiements := r.Group("/api/v1/stripe")
	paiements.Use(middleware.JWTMiddleware())
	{
		paiements.POST("/create-checkout-session", proxy.ProxyRequest("paiements", "/api/stripe/create-checkout-session"))
		paiements.GET("/subscription/status", proxy.ProxyRequest("paiements", "/api/stripe/subscription/status"))
	}
}
