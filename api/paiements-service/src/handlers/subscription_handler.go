package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/matcha/api/paiements-service/src/models"
	"github.com/matcha/api/paiements-service/src/services"
)

// SubscriptionHandler gère les endpoints d'abonnement
type SubscriptionHandler struct {
	subscriptionService *services.SubscriptionService
	checkoutService     *services.CheckoutService
}

// NewSubscriptionHandler crée un nouveau handler d'abonnement
func NewSubscriptionHandler() *SubscriptionHandler {
	return &SubscriptionHandler{
		subscriptionService: services.NewSubscriptionService(),
		checkoutService:     services.NewCheckoutService(),
	}
}

// CreateSubscriptionRequest représente une demande de création d'abonnement
type CreateSubscriptionRequest struct {
	PlanType string `json:"plan_type" binding:"required"`
}

// CreateSubscription crée un nouvel abonnement
func (h *SubscriptionHandler) CreateSubscription(c *gin.Context) {
	// Récupérer l'ID utilisateur depuis le header JWT
	userIDStr := c.GetHeader("X-User-ID")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "User ID required",
		})
		return
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid user ID",
		})
		return
	}

	// Parser la requête
	var req CreateSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request format",
		})
		return
	}

	// Valider le type de plan
	var planType models.PlanType
	switch req.PlanType {
	case "mensuel":
		planType = models.PlanMensuel
	case "annuel":
		planType = models.PlanAnnuel
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid plan type. Must be 'mensuel' or 'annuel'",
		})
		return
	}

	// TODO: Récupérer l'email de l'utilisateur depuis la base de données
	userEmail := "user@example.com" // Placeholder

	// Créer la session de checkout avec le nouveau service
	checkoutSession, err := h.checkoutService.CreateCheckoutSession(uint(userID), planType, userEmail)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	if checkoutSession == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Checkout session is nil",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":  checkoutSession.StripeSessionID,  // Le frontend attend 'id', pas 'session_id'
			"url": fmt.Sprintf("https://checkout.stripe.com/pay/%s", checkoutSession.StripeSessionID),
		},
		"message": "Checkout session created successfully",
	})
}

// GetSubscription récupère l'abonnement de l'utilisateur
func (h *SubscriptionHandler) GetSubscription(c *gin.Context) {
	// Récupérer l'ID utilisateur depuis le header JWT
	userIDStr := c.GetHeader("X-User-ID")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "User ID required",
		})
		return
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid user ID",
		})
		return
	}

	// Récupérer les informations premium
	premiumInfo, err := h.subscriptionService.GetUserPremiumInfo(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    premiumInfo,
	})
}

// CancelSubscriptionRequest représente une demande d'annulation d'abonnement
type CancelSubscriptionRequest struct {
	AtPeriodEnd bool `json:"at_period_end"`
}

// CancelSubscription annule l'abonnement de l'utilisateur
func (h *SubscriptionHandler) CancelSubscription(c *gin.Context) {
	// Récupérer l'ID utilisateur depuis le header JWT
	userIDStr := c.GetHeader("X-User-ID")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "User ID required",
		})
		return
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid user ID",
		})
		return
	}

	// Parser la requête (optionnel)
	var req CancelSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// Par défaut, annuler à la fin de la période
		req.AtPeriodEnd = true
	}

	// Annuler l'abonnement
	err = h.subscriptionService.CancelSubscription(uint(userID), req.AtPeriodEnd)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	message := "Subscription canceled successfully"
	if req.AtPeriodEnd {
		message = "Subscription will be canceled at the end of the billing period"
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": message,
	})
}

// GetBillingPortal crée une session du portail de facturation
func (h *SubscriptionHandler) GetBillingPortal(c *gin.Context) {
	// Récupérer l'ID utilisateur depuis le header JWT
	userIDStr := c.GetHeader("X-User-ID")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "User ID required",
		})
		return
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid user ID",
		})
		return
	}

	// URL de retour (par défaut vers les paramètres)
	returnURL := c.Query("return_url")
	if returnURL == "" {
		returnURL = "http://localhost:5173/settings" // URL par défaut
	}

	// Créer la session du portail de facturation
	portalURL, err := h.subscriptionService.CreateBillingPortalSession(uint(userID), returnURL)
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
			"url": portalURL,
		},
	})
}