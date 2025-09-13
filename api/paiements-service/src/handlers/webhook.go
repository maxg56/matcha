package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/webhook"

	"github.com/matcha/api/paiements-service/src/conf"
	"github.com/matcha/api/paiements-service/src/models"
	"github.com/matcha/api/paiements-service/src/utils"
)

// HandleStripeWebhook handles incoming Stripe webhook events
func HandleStripeWebhook(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("Error reading webhook body: %v", err)
		utils.RespondError(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Verify webhook signature
	endpointSecret := conf.Env.StripeWebhookSecret
	if endpointSecret == "" {
		log.Printf("STRIPE_WEBHOOK_SECRET not configured")
		utils.RespondError(c, http.StatusInternalServerError, "Webhook configuration error")
		return
	}

	// Use ConstructEventWithOptions to handle API version mismatch
	// This allows compatibility between different Stripe API versions
	options := webhook.ConstructEventOptions{
		IgnoreAPIVersionMismatch: true,
	}
	event, err := webhook.ConstructEventWithOptions(body, c.GetHeader("Stripe-Signature"), endpointSecret, options)
	if err != nil {
		log.Printf("Webhook signature verification failed: %v", err)
		utils.RespondError(c, http.StatusBadRequest, "Invalid signature")
		return
	}

	// Check if we've already processed this event (idempotency)
	var existingEvent models.StripeEvent
	if err := conf.DB.Where("stripe_event_id = ?", event.ID).First(&existingEvent).Error; err == nil {
		if existingEvent.Processed {
			log.Printf("Event %s already processed", event.ID)
			utils.RespondSuccess(c, gin.H{"status": "already_processed"})
			return
		}
	}

	// Store the event
	eventData, _ := json.Marshal(event.Data.Object)
	stripeEvent := models.StripeEvent{
		StripeEventID: event.ID,
		EventType:     string(event.Type),
		Processed:     false,
		Data:          string(eventData),
	}

	if err := conf.DB.Create(&stripeEvent).Error; err != nil {
		log.Printf("Failed to store webhook event: %v", err)
		utils.RespondError(c, http.StatusInternalServerError, "Failed to process event")
		return
	}

	// Process the event based on its type
	switch event.Type {
	case "checkout.session.completed":
		err = handleCheckoutSessionCompleted(event)
	case "customer.subscription.created":
		err = handleSubscriptionCreated(event)
	case "customer.subscription.updated":
		err = handleSubscriptionUpdated(event)
	case "customer.subscription.deleted":
		err = handleSubscriptionDeleted(event)
	case "invoice.payment_succeeded":
		err = handlePaymentSucceeded(event)
	case "invoice.payment_failed":
		err = handlePaymentFailed(event)
	default:
		log.Printf("Unhandled event type: %s", event.Type)
		err = nil // Not an error, just unhandled
	}

	if err != nil {
		log.Printf("Failed to process event %s: %v", event.Type, err)
		utils.RespondError(c, http.StatusInternalServerError, "Failed to process webhook event")
		return
	}

	// Mark event as processed
	now := time.Now()
	stripeEvent.Processed = true
	stripeEvent.ProcessedAt = &now
	conf.DB.Save(&stripeEvent)

	log.Printf("Successfully processed webhook event: %s", event.Type)
	utils.RespondSuccess(c, gin.H{"status": "processed"})
}

func handleCheckoutSessionCompleted(event stripe.Event) error {
	var session stripe.CheckoutSession
	if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
		log.Printf("Failed to unmarshal checkout session: %v", err)
		return err
	}

	// Validate session data
	if session.ID == "" {
		log.Printf("Invalid checkout session: missing ID")
		return nil
	}

	userIDStr, exists := session.Metadata["user_id"]
	if !exists {
		log.Printf("No user_id in checkout session metadata")
		return nil
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		return err
	}

	plan, exists := session.Metadata["plan"]
	if !exists {
		log.Printf("No plan in checkout session metadata")
		return nil
	}

	// Validate session data before logging
	subscriptionID := "unknown"
	if session.Subscription != nil {
		subscriptionID = session.Subscription.ID
	}
	log.Printf("Checkout completed for user %d, plan: %s, subscription: %s", userID, plan, subscriptionID)
	return nil
}

func handleSubscriptionCreated(event stripe.Event) error {
	var subscription stripe.Subscription
	if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
		return err
	}

	userIDStr, exists := subscription.Metadata["user_id"]
	if !exists {
		// Try to get user ID from customer metadata
		if subscription.Customer != nil {
			userIDStr, exists = subscription.Customer.Metadata["user_id"]
		}
		if !exists {
			log.Printf("No user_id found in subscription or customer metadata")
			return nil
		}
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		return err
	}

	// Create or update subscription in database
	dbSubscription := models.Subscription{
		UserID:               uint(userID),
		StripeCustomerID:     subscription.Customer.ID,
		StripeSubscriptionID: subscription.ID,
		Status:               string(subscription.Status),
		Plan:                 getSubscriptionPlan(subscription),
		CurrentPeriodStart:   time.Unix(subscription.CurrentPeriodStart, 0),
		CurrentPeriodEnd:     time.Unix(subscription.CurrentPeriodEnd, 0),
		CancelAtPeriodEnd:    subscription.CancelAtPeriodEnd,
	}

	if err := conf.DB.Create(&dbSubscription).Error; err != nil {
		// If creation fails due to duplicate, try update
		if err := conf.DB.Where("stripe_subscription_id = ?", subscription.ID).Updates(&dbSubscription).Error; err != nil {
			return err
		}
	}

	log.Printf("Subscription created for user %d: %s", userID, subscription.ID)
	return nil
}

func handleSubscriptionUpdated(event stripe.Event) error {
	var subscription stripe.Subscription
	if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
		return err
	}

	// Update existing subscription
	updates := models.Subscription{
		Status:             string(subscription.Status),
		CurrentPeriodStart: time.Unix(subscription.CurrentPeriodStart, 0),
		CurrentPeriodEnd:   time.Unix(subscription.CurrentPeriodEnd, 0),
		CancelAtPeriodEnd:  subscription.CancelAtPeriodEnd,
	}

	if err := conf.DB.Where("stripe_subscription_id = ?", subscription.ID).Updates(&updates).Error; err != nil {
		return err
	}

	log.Printf("Subscription updated: %s", subscription.ID)
	return nil
}

func handleSubscriptionDeleted(event stripe.Event) error {
	var subscription stripe.Subscription
	if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
		return err
	}

	// Update subscription status to canceled
	if err := conf.DB.Where("stripe_subscription_id = ?", subscription.ID).Update("status", "canceled").Error; err != nil {
		return err
	}

	log.Printf("Subscription canceled: %s", subscription.ID)
	return nil
}

func handlePaymentSucceeded(event stripe.Event) error {
	var invoice stripe.Invoice
	if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
		log.Printf("Failed to unmarshal invoice: %v", err)
		return err
	}

	// Validate invoice data
	if invoice.ID == "" {
		log.Printf("Invalid invoice: missing ID")
		return nil
	}

	// Validate invoice data
	if invoice.Subscription == nil {
		log.Printf("Invoice has no subscription data: %s", invoice.ID)
		return nil
	}

	// Find the subscription
	var dbSubscription models.Subscription
	if err := conf.DB.Where("stripe_subscription_id = ?", invoice.Subscription.ID).First(&dbSubscription).Error; err != nil {
		log.Printf("Subscription not found for payment: %s", invoice.Subscription.ID)
		return nil
	}

	// Create payment record
	payment := models.Payment{
		UserID:         dbSubscription.UserID,
		SubscriptionID: dbSubscription.ID,
		Amount:         invoice.AmountPaid,
		Currency:       string(invoice.Currency),
		Status:         "succeeded",
		Description:    invoice.Description,
	}

	if invoice.Charge != nil {
		payment.StripeChargeID = invoice.Charge.ID
	}

	if err := conf.DB.Create(&payment).Error; err != nil {
		return err
	}

	log.Printf("Payment succeeded for user %d: %d %s", dbSubscription.UserID, invoice.AmountPaid, invoice.Currency)
	return nil
}

func handlePaymentFailed(event stripe.Event) error {
	var invoice stripe.Invoice
	if err := json.Unmarshal(event.Data.Raw, &invoice); err != nil {
		log.Printf("Failed to unmarshal invoice for payment failed: %v", err)
		return err
	}

	// Validate invoice data
	if invoice.ID == "" {
		log.Printf("Invalid invoice in payment failed: missing ID")
		return nil
	}

	// Validate invoice data before logging
	subscriptionID := "unknown"
	if invoice.Subscription != nil {
		subscriptionID = invoice.Subscription.ID
	}
	log.Printf("Payment failed for subscription: %s", subscriptionID)
	// You might want to notify the user or take other actions here
	return nil
}

func getSubscriptionPlan(subscription stripe.Subscription) string {
	if len(subscription.Items.Data) > 0 {
		priceID := subscription.Items.Data[0].Price.ID
		if priceID == conf.Env.StripePriceMensuel {
			return "mensuel"
		} else if priceID == conf.Env.StripePriceAnnuel {
			return "annuel"
		}
	}
	return "unknown"
}