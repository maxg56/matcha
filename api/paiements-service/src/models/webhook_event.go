package models

import (
	"encoding/json"
	"time"
	"gorm.io/gorm"
	"gorm.io/datatypes"
)

// WebhookEvent représente un événement webhook reçu de Stripe
type WebhookEvent struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	StripeEventID string         `gorm:"type:varchar(255);unique;not null" json:"stripe_event_id"`
	EventType     string         `gorm:"type:varchar(100);not null;index" json:"event_type"`
	Processed     bool           `gorm:"default:false;index" json:"processed"`
	ProcessedAt   *time.Time     `json:"processed_at"`
	Data          datatypes.JSON `gorm:"type:jsonb;not null" json:"data"`
	ErrorMessage  *string        `gorm:"type:text" json:"error_message"`
	RetryCount    int            `gorm:"default:0" json:"retry_count"`
	CreatedAt     time.Time      `json:"created_at"`
}

// TableName spécifie le nom de la table pour GORM
func (WebhookEvent) TableName() string {
	return "webhook_events"
}

// MarkAsProcessed marque l'événement comme traité
func (w *WebhookEvent) MarkAsProcessed() {
	w.Processed = true
	now := time.Now()
	w.ProcessedAt = &now
}

// MarkAsError marque l'événement comme ayant échoué avec un message d'erreur
func (w *WebhookEvent) MarkAsError(errorMsg string) {
	w.ErrorMessage = &errorMsg
	w.RetryCount++
}

// ShouldRetry détermine si l'événement doit être retenté
func (w *WebhookEvent) ShouldRetry() bool {
	const maxRetries = 3
	return w.RetryCount < maxRetries && !w.Processed
}

// GetEventData désérialise les données de l'événement
func (w *WebhookEvent) GetEventData(target interface{}) error {
	return json.Unmarshal(w.Data, target)
}

// SetEventData sérialise et stocke les données de l'événement
func (w *WebhookEvent) SetEventData(data interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	w.Data = datatypes.JSON(jsonData)
	return nil
}

// BeforeCreate hook appelé avant la création
func (w *WebhookEvent) BeforeCreate(tx *gorm.DB) error {
	w.CreatedAt = time.Now()
	return nil
}

// IsPaymentEvent vérifie si l'événement est lié aux paiements
func (w *WebhookEvent) IsPaymentEvent() bool {
	paymentEvents := map[string]bool{
		"invoice.payment_succeeded":      true,
		"invoice.payment_failed":         true,
		"payment_intent.succeeded":       true,
		"payment_intent.payment_failed":  true,
	}
	return paymentEvents[w.EventType]
}

// IsSubscriptionEvent vérifie si l'événement est lié aux abonnements
func (w *WebhookEvent) IsSubscriptionEvent() bool {
	subscriptionEvents := map[string]bool{
		"customer.subscription.created":  true,
		"customer.subscription.updated":  true,
		"customer.subscription.deleted":  true,
		"customer.subscription.trial_will_end": true,
	}
	return subscriptionEvents[w.EventType]
}

// WebhookEventSummary représente un résumé d'événement webhook pour les APIs
type WebhookEventSummary struct {
	ID          uint      `json:"id"`
	EventType   string    `json:"event_type"`
	Processed   bool      `json:"processed"`
	ProcessedAt *time.Time `json:"processed_at"`
	RetryCount  int       `json:"retry_count"`
	CreatedAt   time.Time `json:"created_at"`
}

// ToSummary convertit un WebhookEvent en WebhookEventSummary
func (w *WebhookEvent) ToSummary() WebhookEventSummary {
	return WebhookEventSummary{
		ID:          w.ID,
		EventType:   w.EventType,
		Processed:   w.Processed,
		ProcessedAt: w.ProcessedAt,
		RetryCount:  w.RetryCount,
		CreatedAt:   w.CreatedAt,
	}
}