package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/matcha/api/paiements-service/src/models"
	"github.com/matcha/api/paiements-service/src/services"
)

// StripeController gère les endpoints Stripe legacy
type StripeController struct {
	stripeService *services.StripeService
}

// NewStripeController crée un nouveau contrôleur Stripe
func NewStripeController() *StripeController {
	return &StripeController{
		stripeService: services.NewStripeService(),
	}
}

// CreateCheckoutSession crée une session de checkout (legacy endpoint)
func (sc *StripeController) CreateCheckoutSession(c *gin.Context) {
	var body struct {
		Plan string `json:"plan"`
	}
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request",
		})
		return
	}

	// Récupérer l'ID utilisateur depuis le header JWT si disponible
	userIDStr := c.GetHeader("X-User-ID")
	var userID uint = 1 // Valeur par défaut pour la compatibilité

	if userIDStr != "" {
		if parsedUserID, err := strconv.ParseUint(userIDStr, 10, 32); err == nil {
			userID = uint(parsedUserID)
		}
	}

	// Convertir le plan
	var planType models.PlanType
	switch body.Plan {
	case "mensuel":
		planType = models.PlanMensuel
	case "annuel":
		planType = models.PlanAnnuel
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid plan",
		})
		return
	}

	// Utiliser le nouveau service Stripe
	session, err := sc.stripeService.CreateCheckoutSession(userID, planType, "user@example.com")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":  session.ID,
			"url": session.URL,
		},
	})
}