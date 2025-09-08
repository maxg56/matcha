package routes

import (
    "gateway/src/proxy"
    "github.com/gin-gonic/gin"
)

func SetupPaiementsRoutes(r *gin.Engine) {
    paiements := r.Group("/api/stripe")

    paiements.POST("/create-checkout-session", proxy.ProxyRequest("paiements-service", "/api/stripe/create-checkout-session"))
}
