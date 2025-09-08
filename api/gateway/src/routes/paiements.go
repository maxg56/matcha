package routes

import (
	"github.com/gin-gonic/gin"
	"gateway/src/proxy"
	"gateway/src/middleware"
)

// SetupPaiementsRoutes configure les routes pour le service paiements
func SetupPaiementsRoutes(r *gin.Engine) {
	paiements := r.Group("/api/stripe")

	// Ici on forward toutes les requêtes vers le microservice paiements
	paiements.POST("/create-checkout-session", proxy.ProxyRequest("paiements", "/api/stripe/create-checkout-session"))
	paiements.GET("/some-other-route", proxy.ProxyRequest("paiements", "/api/stripe/some-other-route"))

	// Si tu veux sécuriser certaines routes
	protected := paiements.Group("")
	protected.Use(middleware.JWTMiddleware())
	{
		protected.POST("/protected-route", proxy.ProxyRequest("paiements", "/api/stripe/protected-route"))
	}
}
