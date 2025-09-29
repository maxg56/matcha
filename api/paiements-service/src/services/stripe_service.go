package services

import (
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/matcha/api/paiements-service/src/models"
	"github.com/matcha/api/paiements-service/src/conf"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/customer"
	"github.com/stripe/stripe-go/v76/subscription"
	portalsession "github.com/stripe/stripe-go/v76/billingportal/session"
)

// StripeService gère les interactions avec l'API Stripe
type StripeService struct {
	secretKey         string
	webhookSecret     string
	monthlyPriceID    string
	yearlyPriceID     string
	successURL        string
	cancelURL         string
}

// NewStripeService crée une nouvelle instance du service Stripe
func NewStripeService() *StripeService {
	secretKey := os.Getenv("STRIPE_SECRET_KEY")
	if secretKey == "" {
		log.Fatal("STRIPE_SECRET_KEY environment variable is required")
	}

	stripe.Key = secretKey

	return &StripeService{
		secretKey:         secretKey,
		webhookSecret:     os.Getenv("STRIPE_WEBHOOK_SECRET"),
		monthlyPriceID:    os.Getenv("STRIPE_PRICE_MENSUEL"),
		yearlyPriceID:     os.Getenv("STRIPE_PRICE_ANNUEL"),
		successURL:        os.Getenv("STRIPE_SUCCESS_URL"),
		cancelURL:         os.Getenv("STRIPE_CANCEL_URL"),
	}
}

// CreateCheckoutSession crée une session de checkout Stripe
func (s *StripeService) CreateCheckoutSession(userID uint, planType models.PlanType, userEmail string) (*stripe.CheckoutSession, error) {
	// Récupérer l'ID du prix selon le plan
	var priceID string
	switch planType {
	case models.PlanMensuel:
		priceID = s.monthlyPriceID
	case models.PlanAnnuel:
		priceID = s.yearlyPriceID
	default:
		return nil, errors.New("invalid plan type")
	}

	if priceID == "" {
		return nil, fmt.Errorf("price ID not configured for plan type: %s", planType)
	}

	// Récupérer ou créer le customer Stripe
	customerID, err := s.getOrCreateCustomer(userID, userEmail)
	if err != nil {
		return nil, fmt.Errorf("failed to get or create customer: %w", err)
	}

	// Paramètres de la session de checkout
	params := &stripe.CheckoutSessionParams{
		Customer:           stripe.String(customerID),
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceID),
				Quantity: stripe.Int64(1),
			},
		},
		Mode:       stripe.String("subscription"),
		SuccessURL: stripe.String(s.successURL),
		CancelURL:  stripe.String(s.cancelURL),
		Metadata: map[string]string{
			"user_id":   fmt.Sprintf("%d", userID),
			"plan_type": string(planType),
		},
	}

	sess, err := session.New(params)
	if err != nil {
		return nil, fmt.Errorf("failed to create checkout session: %w", err)
	}

	log.Printf("Created checkout session %s for user %d with plan %s", sess.ID, userID, planType)
	return sess, nil
}

// CreateBillingPortalSession crée une session du portail de facturation
func (s *StripeService) CreateBillingPortalSession(customerID, returnURL string) (*stripe.BillingPortalSession, error) {
	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(customerID),
		ReturnURL: stripe.String(returnURL),
	}

	sess, err := portalsession.New(params)
	if err != nil {
		return nil, fmt.Errorf("failed to create billing portal session: %w", err)
	}

	return sess, nil
}

// CancelSubscription annule un abonnement Stripe
func (s *StripeService) CancelSubscription(subscriptionID string, atPeriodEnd bool) (*stripe.Subscription, error) {
	params := &stripe.SubscriptionParams{}

	if atPeriodEnd {
		params.CancelAtPeriodEnd = stripe.Bool(true)
	} else {
		params.CancelAtPeriodEnd = stripe.Bool(false)
	}

	sub, err := subscription.Update(subscriptionID, params)
	if err != nil {
		return nil, fmt.Errorf("failed to cancel subscription: %w", err)
	}

	log.Printf("Subscription %s cancel_at_period_end set to %t", subscriptionID, atPeriodEnd)
	return sub, nil
}

// GetSubscription récupère un abonnement Stripe
func (s *StripeService) GetSubscription(subscriptionID string) (*stripe.Subscription, error) {
	sub, err := subscription.Get(subscriptionID, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get subscription: %w", err)
	}

	return sub, nil
}

// GetCustomer récupère un customer Stripe
func (s *StripeService) GetCustomer(customerID string) (*stripe.Customer, error) {
	cust, err := customer.Get(customerID, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get customer: %w", err)
	}

	return cust, nil
}

// getOrCreateCustomer récupère ou crée un customer Stripe pour un utilisateur
func (s *StripeService) getOrCreateCustomer(userID uint, userEmail string) (string, error) {
	// Vérifier si l'utilisateur a déjà un customer Stripe
	var subscription models.Subscription
	if err := conf.DB.Where("user_id = ?", userID).First(&subscription).Error; err == nil {
		// L'utilisateur a déjà un abonnement, retourner le customer ID existant
		if subscription.StripeCustomerID != "" {
			return subscription.StripeCustomerID, nil
		}
	}

	// Créer un nouveau customer Stripe
	params := &stripe.CustomerParams{
		Email: stripe.String(userEmail),
		Metadata: map[string]string{
			"user_id": fmt.Sprintf("%d", userID),
		},
	}

	cust, err := customer.New(params)
	if err != nil {
		return "", fmt.Errorf("failed to create customer: %w", err)
	}

	log.Printf("Created Stripe customer %s for user %d", cust.ID, userID)
	return cust.ID, nil
}

// GetWebhookSecret retourne le secret webhook
func (s *StripeService) GetWebhookSecret() string {
	return s.webhookSecret
}

// ConvertStripePlanType convertit un plan Stripe en modèle interne
func ConvertStripePlanType(stripePriceID string) models.PlanType {
	monthlyPriceID := os.Getenv("STRIPE_PRICE_MENSUEL")
	yearlyPriceID := os.Getenv("STRIPE_PRICE_ANNUEL")

	switch stripePriceID {
	case monthlyPriceID:
		return models.PlanMensuel
	case yearlyPriceID:
		return models.PlanAnnuel
	default:
		return models.PlanMensuel // Par défaut
	}
}

// ConvertStripeStatus convertit un statut Stripe en modèle interne
func ConvertStripeStatus(stripeStatus stripe.SubscriptionStatus) models.SubscriptionStatus {
	switch stripeStatus {
	case stripe.SubscriptionStatusActive:
		return models.StatusActive
	case stripe.SubscriptionStatusCanceled:
		return models.StatusCanceled
	case stripe.SubscriptionStatusIncomplete:
		return models.StatusInactive
	case stripe.SubscriptionStatusIncompleteExpired:
		return models.StatusInactive
	case stripe.SubscriptionStatusPastDue:
		return models.StatusPastDue
	case stripe.SubscriptionStatusUnpaid:
		return models.StatusUnpaid
	case stripe.SubscriptionStatusTrialing:
		return models.StatusActive
	default:
		return models.StatusInactive
	}
}

// ConvertTimestamp convertit un timestamp Unix en time.Time
func ConvertTimestamp(timestamp int64) time.Time {
	return time.Unix(timestamp, 0)
}