package handlers

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/matcha/api/paiements-service/src/services"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/webhook"
)

// WebhookHandler gère les webhooks Stripe
type WebhookHandler struct {
	eventService  *services.EventService
	stripeService *services.StripeService
}

// NewWebhookHandler crée un nouveau handler de webhook
func NewWebhookHandler() *WebhookHandler {
	return &WebhookHandler{
		eventService:  services.NewEventService(),
		stripeService: services.NewStripeService(),
	}
}

// HandleStripeWebhook traite les webhooks Stripe
func (h *WebhookHandler) HandleStripeWebhook(c *gin.Context) {
	// Lire le corps de la requête
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("Failed to read webhook body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to read request body",
		})
		return
	}

	// Récupérer la signature Stripe
	signature := c.GetHeader("Stripe-Signature")
	if signature == "" {
		log.Printf("Missing Stripe-Signature header")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing Stripe signature",
		})
		return
	}

	// Vérifier la signature du webhook
	webhookSecret := h.stripeService.GetWebhookSecret()
	if webhookSecret == "" {
		log.Printf("Webhook secret not configured")
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Webhook secret not configured",
		})
		return
	}

	// Construire l'événement Stripe avec vérification de signature
	event, err := webhook.ConstructEvent(body, signature, webhookSecret)
	if err != nil {
		log.Printf("Failed to verify webhook signature: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid signature",
		})
		return
	}

	// Logger l'événement reçu
	log.Printf("Received Stripe webhook: %s (ID: %s)", event.Type, event.ID)

	// Traiter l'événement de manière asynchrone
	go func() {
		if err := h.eventService.ProcessWebhookEvent(&event); err != nil {
			log.Printf("Failed to process webhook event %s: %v", event.ID, err)
		}
	}()

	// Répondre immédiatement à Stripe pour confirmer la réception
	c.JSON(http.StatusOK, gin.H{
		"received": true,
	})
}

// GetWebhookEvents récupère l'historique des événements webhook (endpoint admin)
func (h *WebhookHandler) GetWebhookEvents(c *gin.Context) {
	// Vérifier l'authentification admin
	if !h.isAdminRequest(c) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Admin access required",
		})
		return
	}

	// Paramètres de pagination
	limit := 50
	offset := 0

	if limitStr := c.Query("limit"); limitStr != "" {
		if parsedLimit, err := parseInt(limitStr); err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if parsedOffset, err := parseInt(offsetStr); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	// Récupérer l'historique des événements
	events, err := h.eventService.GetEventHistory(limit, offset)
	if err != nil {
		log.Printf("Failed to get event history: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve event history",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"events": events,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// RetryFailedEvents relance le traitement des événements qui ont échoué (endpoint admin)
func (h *WebhookHandler) RetryFailedEvents(c *gin.Context) {
	// Vérifier l'authentification admin
	if !h.isAdminRequest(c) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Admin access required",
		})
		return
	}

	// Relancer les événements échoués
	if err := h.eventService.RetryFailedEvents(); err != nil {
		log.Printf("Failed to retry failed events: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retry failed events",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Failed events retry initiated",
	})
}

// TestWebhook endpoint de test pour vérifier la connectivité webhook
func (h *WebhookHandler) TestWebhook(c *gin.Context) {
	// Créer un événement de test
	testEvent := &stripe.Event{
		ID:   "evt_test_webhook",
		Type: "test.webhook",
		Data: &stripe.EventData{
			Raw: []byte(`{"object": "test"}`),
		},
	}

	log.Printf("Processing test webhook event")

	// Traiter l'événement de test
	if err := h.eventService.ProcessWebhookEvent(testEvent); err != nil {
		log.Printf("Test webhook failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Test webhook processed successfully",
	})
}

// isAdminRequest vérifie si la requête provient d'un admin
func (h *WebhookHandler) isAdminRequest(c *gin.Context) bool {
	// Vérifier la clé API interne
	internalKey := c.GetHeader("X-Internal-Key")
	expectedKey := getEnv("INTERNAL_API_KEY", "")

	if expectedKey == "" {
		log.Printf("INTERNAL_API_KEY not configured")
		return false
	}

	return internalKey == expectedKey
}

// parseInt parse une chaîne en entier
func parseInt(s string) (int, error) {
	result := 0
	for _, char := range s {
		if char < '0' || char > '9' {
			return 0, fmt.Errorf("invalid character")
		}
		result = result*10 + int(char-'0')
	}
	return result, nil
}

// getEnv récupère une variable d'environnement avec une valeur par défaut
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}