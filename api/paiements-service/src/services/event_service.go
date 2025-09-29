package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/matcha/api/paiements-service/src/models"
	"github.com/matcha/api/paiements-service/src/conf"
	"github.com/stripe/stripe-go/v76"
	"gorm.io/gorm"
)

// EventService gère les événements webhook et leur traitement
type EventService struct {
	subscriptionService *SubscriptionService
	paymentService      *PaymentService
	websocketService    *WebSocketService
}

// NewEventService crée une nouvelle instance du service d'événements
func NewEventService() *EventService {
	return &EventService{
		subscriptionService: NewSubscriptionService(),
		paymentService:      NewPaymentService(),
		websocketService:    NewWebSocketService(),
	}
}

// ProcessWebhookEvent traite un événement webhook reçu de Stripe
func (s *EventService) ProcessWebhookEvent(event *stripe.Event) error {
	// Vérifier si l'événement a déjà été traité
	var existingEvent models.WebhookEvent
	err := conf.DB.Where("stripe_event_id = ?", event.ID).First(&existingEvent).Error
	if err == nil {
		if existingEvent.Processed {
			log.Printf("Event %s already processed, skipping", event.ID)
			return nil
		}
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return fmt.Errorf("failed to check existing event: %w", err)
	}

	// Créer l'enregistrement de l'événement
	webhookEvent := &models.WebhookEvent{
		StripeEventID: event.ID,
		EventType:     string(event.Type),
	}

	// Sérialiser les données de l'événement
	if err := webhookEvent.SetEventData(event.Data); err != nil {
		return fmt.Errorf("failed to serialize event data: %w", err)
	}

	// Sauvegarder l'événement
	if err := conf.DB.Create(webhookEvent).Error; err != nil {
		return fmt.Errorf("failed to save webhook event: %w", err)
	}

	// Traiter l'événement selon son type
	if err := s.handleEventByType(event, webhookEvent); err != nil {
		// Marquer l'événement comme ayant échoué
		webhookEvent.MarkAsError(err.Error())
		conf.DB.Save(webhookEvent)
		return fmt.Errorf("failed to handle event %s: %w", event.Type, err)
	}

	// Marquer l'événement comme traité
	webhookEvent.MarkAsProcessed()
	if err := conf.DB.Save(webhookEvent).Error; err != nil {
		log.Printf("Failed to mark event as processed: %v", err)
	}

	log.Printf("Successfully processed event %s of type %s", event.ID, event.Type)
	return nil
}

// handleEventByType traite un événement selon son type
func (s *EventService) handleEventByType(event *stripe.Event, webhookEvent *models.WebhookEvent) error {
	switch event.Type {
	case "customer.subscription.created":
		return s.handleSubscriptionCreated(event)
	case "customer.subscription.updated":
		return s.handleSubscriptionUpdated(event)
	case "customer.subscription.deleted":
		return s.handleSubscriptionDeleted(event)
	case "invoice.payment_succeeded":
		return s.handleInvoicePaymentSucceeded(event)
	case "invoice.payment_failed":
		return s.handleInvoicePaymentFailed(event)
	case "payment_intent.succeeded":
		return s.handlePaymentIntentSucceeded(event)
	case "payment_intent.payment_failed":
		return s.handlePaymentIntentFailed(event)
	default:
		log.Printf("Unhandled event type: %s", event.Type)
		return nil // Ne pas considérer comme une erreur
	}
}

// handleSubscriptionCreated traite la création d'un abonnement
func (s *EventService) handleSubscriptionCreated(event *stripe.Event) error {
	var subscription stripe.Subscription
	if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
		return fmt.Errorf("failed to parse subscription data: %w", err)
	}

	// Créer l'abonnement dans notre base de données
	createdSubscription, err := s.subscriptionService.CreateSubscriptionFromStripe(&subscription)
	if err != nil {
		return fmt.Errorf("failed to create subscription: %w", err)
	}

	// Envoyer une notification WebSocket
	if createdSubscription != nil {
		s.websocketService.SendSubscriptionEvent(createdSubscription.UserID, "subscription_created", map[string]interface{}{
			"subscription_id": createdSubscription.ID,
			"plan_type":       createdSubscription.PlanType,
			"status":          createdSubscription.Status,
		})
	}

	return nil
}

// handleSubscriptionUpdated traite la mise à jour d'un abonnement
func (s *EventService) handleSubscriptionUpdated(event *stripe.Event) error {
	var subscription stripe.Subscription
	if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
		return fmt.Errorf("failed to parse subscription data: %w", err)
	}

	// Mettre à jour l'abonnement dans notre base de données
	updatedSubscription, err := s.subscriptionService.UpdateSubscriptionFromStripe(&subscription)
	if err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	// Envoyer une notification WebSocket
	if updatedSubscription != nil {
		s.websocketService.SendSubscriptionEvent(updatedSubscription.UserID, "subscription_updated", map[string]interface{}{
			"subscription_id": updatedSubscription.ID,
			"status":          updatedSubscription.Status,
			"cancel_at_period_end": updatedSubscription.CancelAtPeriodEnd,
		})
	}

	return nil
}

// handleSubscriptionDeleted traite la suppression d'un abonnement
func (s *EventService) handleSubscriptionDeleted(event *stripe.Event) error {
	var subscription stripe.Subscription
	if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
		return fmt.Errorf("failed to parse subscription data: %w", err)
	}

	// Marquer l'abonnement comme annulé
	var localSubscription models.Subscription
	if err := conf.DB.Where("stripe_subscription_id = ?", subscription.ID).First(&localSubscription).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("Subscription %s not found in database", subscription.ID)
			return nil
		}
		return fmt.Errorf("failed to find subscription: %w", err)
	}

	// Mettre à jour le statut
	localSubscription.Status = models.StatusCanceled
	now := time.Now()
	localSubscription.CanceledAt = &now

	if err := conf.DB.Save(&localSubscription).Error; err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	// Envoyer une notification WebSocket
	s.websocketService.SendSubscriptionEvent(localSubscription.UserID, "subscription_cancelled", map[string]interface{}{
		"subscription_id": localSubscription.ID,
		"canceled_at":     localSubscription.CanceledAt,
	})

	return nil
}

// handleInvoicePaymentSucceeded traite le succès d'un paiement de facture
func (s *EventService) handleInvoicePaymentSucceeded(event *stripe.Event) error {
	var invoice stripe.Invoice
	if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
		return fmt.Errorf("failed to parse invoice data: %w", err)
	}

	// Créer un enregistrement de paiement
	if err := s.paymentService.CreatePaymentFromInvoice(&invoice); err != nil {
		return fmt.Errorf("failed to create payment record: %w", err)
	}

	// Récupérer l'abonnement associé si disponible
	if invoice.Subscription != nil {
		var subscription models.Subscription
		if err := conf.DB.Where("stripe_subscription_id = ?", invoice.Subscription.ID).First(&subscription).Error; err == nil {
			// Envoyer une notification WebSocket
			s.websocketService.SendSubscriptionEvent(subscription.UserID, "payment_succeeded", map[string]interface{}{
				"amount":   float64(invoice.AmountPaid) / 100.0,
				"currency": invoice.Currency,
				"invoice_id": invoice.ID,
			})
		}
	}

	return nil
}

// handleInvoicePaymentFailed traite l'échec d'un paiement de facture
func (s *EventService) handleInvoicePaymentFailed(event *stripe.Event) error {
	var invoice stripe.Invoice
	if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
		return fmt.Errorf("failed to parse invoice data: %w", err)
	}

	// Récupérer l'abonnement associé si disponible
	if invoice.Subscription != nil {
		var subscription models.Subscription
		if err := conf.DB.Where("stripe_subscription_id = ?", invoice.Subscription.ID).First(&subscription).Error; err == nil {
			// Envoyer une notification WebSocket
			s.websocketService.SendSubscriptionEvent(subscription.UserID, "payment_failed", map[string]interface{}{
				"amount":     float64(invoice.AmountDue) / 100.0,
				"currency":   invoice.Currency,
				"invoice_id": invoice.ID,
				"reason":     "Payment failed",
			})
		}
	}

	return nil
}

// handlePaymentIntentSucceeded traite le succès d'un PaymentIntent
func (s *EventService) handlePaymentIntentSucceeded(event *stripe.Event) error {
	var paymentIntent stripe.PaymentIntent
	if err := json.Unmarshal(event.Data.Raw, &paymentIntent); err != nil {
		return fmt.Errorf("failed to parse payment intent data: %w", err)
	}

	// Créer un enregistrement de paiement
	if err := s.paymentService.CreatePaymentFromPaymentIntent(&paymentIntent); err != nil {
		return fmt.Errorf("failed to create payment record: %w", err)
	}

	return nil
}

// handlePaymentIntentFailed traite l'échec d'un PaymentIntent
func (s *EventService) handlePaymentIntentFailed(event *stripe.Event) error {
	var paymentIntent stripe.PaymentIntent
	if err := json.Unmarshal(event.Data.Raw, &paymentIntent); err != nil {
		return fmt.Errorf("failed to parse payment intent data: %w", err)
	}

	// Mettre à jour le statut du paiement
	var failureReason *string
	if paymentIntent.LastPaymentError != nil {
		message := string(paymentIntent.LastPaymentError.Code)
		failureReason = &message
	}

	if err := s.paymentService.UpdatePaymentStatus(paymentIntent.ID, models.PaymentFailed, failureReason); err != nil {
		return fmt.Errorf("failed to update payment status: %w", err)
	}

	return nil
}

// RetryFailedEvents relance le traitement des événements qui ont échoué
func (s *EventService) RetryFailedEvents() error {
	var failedEvents []models.WebhookEvent
	if err := conf.DB.Where("processed = ? AND retry_count < ?", false, 3).Find(&failedEvents).Error; err != nil {
		return fmt.Errorf("failed to find failed events: %w", err)
	}

	for _, event := range failedEvents {
		if !event.ShouldRetry() {
			continue
		}

		log.Printf("Retrying event %s (attempt %d)", event.StripeEventID, event.RetryCount+1)

		// Désérialiser les données de l'événement
		var eventData map[string]interface{}
		if err := event.GetEventData(&eventData); err != nil {
			log.Printf("Failed to deserialize event data for %s: %v", event.StripeEventID, err)
			continue
		}

		// Créer un événement Stripe factice pour le retraitement
		stripeEvent := &stripe.Event{
			ID:   event.StripeEventID,
			Type: stripe.EventType(event.EventType),
			Data: &stripe.EventData{
				Raw: json.RawMessage(event.Data),
			},
		}

		// Retraiter l'événement
		if err := s.handleEventByType(stripeEvent, &event); err != nil {
			event.MarkAsError(err.Error())
			log.Printf("Retry failed for event %s: %v", event.StripeEventID, err)
		} else {
			event.MarkAsProcessed()
			log.Printf("Successfully retried event %s", event.StripeEventID)
		}

		// Sauvegarder les modifications
		conf.DB.Save(&event)
	}

	return nil
}

// GetEventHistory récupère l'historique des événements
func (s *EventService) GetEventHistory(limit int, offset int) ([]models.WebhookEventSummary, error) {
	var events []models.WebhookEvent
	if err := conf.DB.Order("created_at DESC").Limit(limit).Offset(offset).Find(&events).Error; err != nil {
		return nil, fmt.Errorf("failed to get event history: %w", err)
	}

	summaries := make([]models.WebhookEventSummary, len(events))
	for i, event := range events {
		summaries[i] = event.ToSummary()
	}

	return summaries, nil
}