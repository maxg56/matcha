package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/matcha/api/paiements-service/src/services"
)

// PaymentHandler gère les endpoints de paiement
type PaymentHandler struct {
	paymentService *services.PaymentService
}

// NewPaymentHandler crée un nouveau handler de paiement
func NewPaymentHandler() *PaymentHandler {
	return &PaymentHandler{
		paymentService: services.NewPaymentService(),
	}
}

// GetPaymentHistory récupère l'historique des paiements de l'utilisateur
func (h *PaymentHandler) GetPaymentHistory(c *gin.Context) {
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

	// Paramètres de pagination
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Récupérer l'historique des paiements
	payments, err := h.paymentService.GetUserPaymentHistory(uint(userID), limit, offset)
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
			"payments": payments,
			"limit":    limit,
			"offset":   offset,
		},
	})
}

// GetPaymentStats récupère les statistiques de paiement de l'utilisateur
func (h *PaymentHandler) GetPaymentStats(c *gin.Context) {
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

	// Récupérer les statistiques de paiement
	stats, err := h.paymentService.GetPaymentStats(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}

// CreateTestPayment crée un paiement de test pour l'utilisateur
func (h *PaymentHandler) CreateTestPayment(c *gin.Context) {
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
	var req services.CreateTestPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request format: " + err.Error(),
		})
		return
	}

	// Créer le paiement de test
	payment, err := h.paymentService.CreateTestPayment(uint(userID), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    payment.ToSummary(),
		"message": "Test payment created successfully",
	})
}

// SyncPayments synchronise tous les paiements depuis Stripe (endpoint admin)
func (h *PaymentHandler) SyncPayments(c *gin.Context) {
	// Lancer la synchronisation
	result, err := h.paymentService.SyncPaymentsFromStripe()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
		"message": "Payment synchronization completed",
	})
}

// SyncUserPayments synchronise les paiements d'un utilisateur spécifique (endpoint admin)
func (h *PaymentHandler) SyncUserPayments(c *gin.Context) {
	// Récupérer l'ID utilisateur depuis les paramètres
	userIDStr := c.Param("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
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

	// Lancer la synchronisation pour cet utilisateur
	result, err := h.paymentService.SyncUserPaymentsFromStripe(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
		"message": fmt.Sprintf("Payment synchronization completed for user %d", userID),
	})
}