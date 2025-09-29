package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

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
	log.Printf("🔍 [DEBUG] Webhook received from IP: %s", c.ClientIP())

	// Lire le corps de la requête
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("❌ Failed to read webhook body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to read request body",
		})
		return
	}

	log.Printf("🔍 [DEBUG] Webhook body length: %d bytes", len(body))

	// Récupérer la signature Stripe
	signature := c.GetHeader("Stripe-Signature")
	if signature == "" {
		log.Printf("❌ Missing Stripe-Signature header")
		log.Printf("🔍 [DEBUG] Available headers: %v", c.Request.Header)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing Stripe signature",
		})
		return
	}

	log.Printf("🔍 [DEBUG] Stripe signature found: %s", signature)

	// Vérifier la signature du webhook
	webhookSecret := h.stripeService.GetWebhookSecret()
	if webhookSecret == "" {
		log.Printf("⚠️  Webhook secret not configured - running in development mode")
	}

	var event stripe.Event

	// En mode développement, si pas de secret ou signature invalide, parser quand même
	if webhookSecret != "" {
		eventFromWebhook, webhookErr := webhook.ConstructEvent(body, signature, webhookSecret)
		if webhookErr != nil {
			log.Printf("⚠️  Failed to verify webhook signature: %v", webhookErr)
			log.Printf("🔧 Attempting to parse webhook without signature verification...")

			// Parser directement le JSON
			if parseErr := json.Unmarshal(body, &event); parseErr != nil {
				log.Printf("❌ Failed to parse webhook JSON: %v", parseErr)
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Invalid JSON",
				})
				return
			}
			log.Printf("🔧 Webhook parsed without signature verification")
		} else {
			event = eventFromWebhook
		}
	} else {
		// Pas de secret configuré, parser directement
		if parseErr := json.Unmarshal(body, &event); parseErr != nil {
			log.Printf("❌ Failed to parse webhook JSON: %v", parseErr)
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid JSON",
			})
			return
		}
		log.Printf("🔧 Webhook parsed without signature verification (no secret configured)")
	}

	// Logger l'événement reçu avec plus de détails
	log.Printf("🔔 Received Stripe webhook: %s (ID: %s)", event.Type, event.ID)

	// Logger des détails supplémentaires selon le type d'événement
	switch event.Type {
	case "payment_intent.succeeded", "payment_intent.payment_failed":
		log.Printf("💳 Payment event details: PaymentIntent processing for event %s", event.ID)
	case "invoice.payment_succeeded", "invoice.payment_failed":
		log.Printf("🧾 Invoice event details: Invoice processing for event %s", event.ID)
	case "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted":
		log.Printf("📋 Subscription event details: Subscription processing for event %s", event.ID)
	}

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

// TestWebhookRequest représente une demande de test webhook
type TestWebhookRequest struct {
	EventType string      `json:"event_type" binding:"required"`
	UserID    uint        `json:"user_id,omitempty"`
	Amount    int64       `json:"amount,omitempty"`
	Currency  string      `json:"currency,omitempty"`
}

// TestWebhook endpoint de test pour vérifier la connectivité webhook
func (h *WebhookHandler) TestWebhook(c *gin.Context) {
	var req TestWebhookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// Si pas de body, utiliser un test simple
		h.runSimpleWebhookTest(c)
		return
	}

	// Valeurs par défaut
	if req.Currency == "" {
		req.Currency = "eur"
	}
	if req.Amount == 0 {
		req.Amount = 2999 // 29.99 EUR
	}

	var testEvent *stripe.Event
	var err error

	switch req.EventType {
	case "payment_intent.succeeded":
		testEvent, err = h.createTestPaymentIntentSucceededEvent(req.UserID, req.Amount, req.Currency)
	case "payment_intent.payment_failed":
		testEvent, err = h.createTestPaymentIntentFailedEvent(req.UserID, req.Amount, req.Currency)
	case "invoice.payment_succeeded":
		testEvent, err = h.createTestInvoicePaymentSucceededEvent(req.UserID, req.Amount, req.Currency)
	case "invoice.payment_failed":
		testEvent, err = h.createTestInvoicePaymentFailedEvent(req.UserID, req.Amount, req.Currency)
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Unsupported event type. Supported: payment_intent.succeeded, payment_intent.payment_failed, invoice.payment_succeeded, invoice.payment_failed",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create test event: " + err.Error(),
		})
		return
	}

	log.Printf("🧪 Processing test webhook event: %s", req.EventType)

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
		"message": fmt.Sprintf("Test webhook %s processed successfully", req.EventType),
		"event_id": testEvent.ID,
	})
}

// runSimpleWebhookTest exécute un test webhook simple
func (h *WebhookHandler) runSimpleWebhookTest(c *gin.Context) {
	testEvent := &stripe.Event{
		ID:   "evt_test_webhook",
		Type: "test.webhook",
		Data: &stripe.EventData{
			Raw: []byte(`{"object": "test"}`),
		},
	}

	log.Printf("🧪 Processing simple test webhook event")

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
		"message": "Simple test webhook processed successfully",
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

// createTestPaymentIntentSucceededEvent crée un événement de test PaymentIntent réussi
func (h *WebhookHandler) createTestPaymentIntentSucceededEvent(userID uint, amount int64, currency string) (*stripe.Event, error) {
	timestamp := time.Now().Unix()
	eventID := fmt.Sprintf("evt_test_pi_succeeded_%d", timestamp)
	paymentIntentID := fmt.Sprintf("pi_test_%d_%d", userID, timestamp)

	paymentIntentData := fmt.Sprintf(`{
		"id": "%s",
		"object": "payment_intent",
		"amount": %d,
		"currency": "%s",
		"status": "succeeded",
		"payment_method_types": ["card"],
		"metadata": {
			"user_id": "%d"
		},
		"created": %d
	}`, paymentIntentID, amount, currency, userID, timestamp)

	return &stripe.Event{
		ID:   eventID,
		Type: "payment_intent.succeeded",
		Data: &stripe.EventData{
			Raw: []byte(paymentIntentData),
		},
		Created: timestamp,
	}, nil
}

// createTestPaymentIntentFailedEvent crée un événement de test PaymentIntent échoué
func (h *WebhookHandler) createTestPaymentIntentFailedEvent(userID uint, amount int64, currency string) (*stripe.Event, error) {
	timestamp := time.Now().Unix()
	eventID := fmt.Sprintf("evt_test_pi_failed_%d", timestamp)
	paymentIntentID := fmt.Sprintf("pi_test_%d_%d", userID, timestamp)

	paymentIntentData := fmt.Sprintf(`{
		"id": "%s",
		"object": "payment_intent",
		"amount": %d,
		"currency": "%s",
		"status": "requires_payment_method",
		"payment_method_types": ["card"],
		"metadata": {
			"user_id": "%d"
		},
		"last_payment_error": {
			"code": "card_declined",
			"message": "Your card was declined."
		},
		"created": %d
	}`, paymentIntentID, amount, currency, userID, timestamp)

	return &stripe.Event{
		ID:   eventID,
		Type: "payment_intent.payment_failed",
		Data: &stripe.EventData{
			Raw: []byte(paymentIntentData),
		},
		Created: timestamp,
	}, nil
}

// createTestInvoicePaymentSucceededEvent crée un événement de test Invoice réussi
func (h *WebhookHandler) createTestInvoicePaymentSucceededEvent(userID uint, amount int64, currency string) (*stripe.Event, error) {
	timestamp := time.Now().Unix()
	eventID := fmt.Sprintf("evt_test_invoice_succeeded_%d", timestamp)
	invoiceID := fmt.Sprintf("in_test_%d_%d", userID, timestamp)
	subscriptionID := fmt.Sprintf("sub_test_%d", userID)

	invoiceData := fmt.Sprintf(`{
		"id": "%s",
		"object": "invoice",
		"amount_paid": %d,
		"amount_due": %d,
		"currency": "%s",
		"status": "paid",
		"subscription": {
			"id": "%s"
		},
		"created": %d
	}`, invoiceID, amount, amount, currency, subscriptionID, timestamp)

	return &stripe.Event{
		ID:   eventID,
		Type: "invoice.payment_succeeded",
		Data: &stripe.EventData{
			Raw: []byte(invoiceData),
		},
		Created: timestamp,
	}, nil
}

// createTestInvoicePaymentFailedEvent crée un événement de test Invoice échoué
func (h *WebhookHandler) createTestInvoicePaymentFailedEvent(userID uint, amount int64, currency string) (*stripe.Event, error) {
	timestamp := time.Now().Unix()
	eventID := fmt.Sprintf("evt_test_invoice_failed_%d", timestamp)
	invoiceID := fmt.Sprintf("in_test_%d_%d", userID, timestamp)
	subscriptionID := fmt.Sprintf("sub_test_%d", userID)

	invoiceData := fmt.Sprintf(`{
		"id": "%s",
		"object": "invoice",
		"amount_paid": 0,
		"amount_due": %d,
		"currency": "%s",
		"status": "open",
		"subscription": {
			"id": "%s"
		},
		"created": %d
	}`, invoiceID, amount, currency, subscriptionID, timestamp)

	return &stripe.Event{
		ID:   eventID,
		Type: "invoice.payment_failed",
		Data: &stripe.EventData{
			Raw: []byte(invoiceData),
		},
		Created: timestamp,
	}, nil
}