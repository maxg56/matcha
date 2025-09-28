package handlers

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/customer"

	"github.com/matcha/api/paiements-service/src/conf"
	"github.com/matcha/api/paiements-service/src/models"
	"github.com/matcha/api/paiements-service/src/utils"
)

type CreateCheckoutSessionRequest struct {
	Plan string `json:"plan" binding:"required"`
}

type CheckoutSessionResponse struct {
	SessionID string `json:"session_id"`
	URL       string `json:"url"`
}

// CreateCheckoutSession creates a Stripe checkout session for subscription
func CreateCheckoutSession(c *gin.Context) {
	var req CreateCheckoutSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request format")
		return
	}

	// Validate plan
	if req.Plan != "mensuel" && req.Plan != "annuel" {
		utils.RespondError(c, http.StatusBadRequest, "Plan must be 'mensuel' or 'annuel'")
		return
	}

	// Get user ID from middleware
	userID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	userIDUint := userID.(uint)

	// Check if user already has an active subscription
	var existingSubscription models.Subscription
	if err := conf.DB.Where("user_id = ? AND status = ?", userIDUint, "active").First(&existingSubscription).Error; err == nil {
		if existingSubscription.IsActive() {
			utils.RespondError(c, http.StatusConflict, "User already has an active subscription")
			return
		}
	}

	stripe.Key = conf.Env.StripeSecretKey
	if stripe.Key == "" || strings.Contains(stripe.Key, "placeholder") {
		log.Printf("STRIPE_SECRET_KEY not configured properly")
		utils.RespondError(c, http.StatusInternalServerError, "Payment service configuration error")
		return
	}

	// Get price ID based on plan
	var priceID string
	if req.Plan == "mensuel" {
		priceID = conf.Env.StripePriceMensuel
	} else {
		priceID = conf.Env.StripePriceAnnuel
	}

	if priceID == "" || strings.Contains(priceID, "placeholder") {
		log.Printf("Price ID not configured for plan: %s (value: %s)", req.Plan, priceID)
		utils.RespondError(c, http.StatusInternalServerError, "Plan configuration error")
		return
	}

	// Create or get Stripe customer
	customerID, err := getOrCreateStripeCustomer(userIDUint)
	if err != nil {
		log.Printf("Failed to create/get Stripe customer: %v", err)
		utils.RespondError(c, http.StatusInternalServerError, "Failed to initialize payment")
		return
	}

	// Get frontend URL from environment
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000" // fallback
	}

	// Create checkout session
	params := &stripe.CheckoutSessionParams{
		Customer: stripe.String(customerID),
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceID),
				Quantity: stripe.Int64(1),
			},
		},
		Mode:       stripe.String("subscription"),
		SuccessURL: stripe.String(frontendURL + "/payment/success?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String(frontendURL + "/payment/cancel"),
		Metadata: map[string]string{
			"user_id": strconv.Itoa(int(userIDUint)),
			"plan":    req.Plan,
		},
		// Ensure metadata is transferred to the subscription
		SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
			Metadata: map[string]string{
				"user_id": strconv.Itoa(int(userIDUint)),
				"plan":    req.Plan,
			},
		},
	}

	s, err := session.New(params)
	if err != nil {
		log.Printf("Failed to create checkout session: %v", err)
		utils.RespondError(c, http.StatusInternalServerError, "Failed to create payment session")
		return
	}

	log.Printf("Created checkout session for user %d: %s", userIDUint, s.ID)

	utils.RespondSuccess(c, CheckoutSessionResponse{
		SessionID: s.ID,
		URL:       s.URL,
	})
}

// GetSubscriptionStatus returns the current subscription status for the authenticated user
func GetSubscriptionStatus(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	userIDUint := userID.(uint)

	var subscription models.Subscription
	if err := conf.DB.Where("user_id = ?", userIDUint).Order("created_at DESC").First(&subscription).Error; err != nil {
		// No subscription found
		utils.RespondSuccess(c, gin.H{
			"has_subscription": false,
			"status":           "none",
		})
		return
	}

	utils.RespondSuccess(c, gin.H{
		"has_subscription":      true,
		"status":               subscription.Status,
		"plan":                 subscription.Plan,
		"current_period_end":   subscription.CurrentPeriodEnd,
		"cancel_at_period_end": subscription.CancelAtPeriodEnd,
		"is_active":            subscription.IsActive(),
	})
}

// getOrCreateStripeCustomer creates or retrieves existing Stripe customer
func getOrCreateStripeCustomer(userID uint) (string, error) {
	// Check if customer already exists in our database
	var subscription models.Subscription
	if err := conf.DB.Where("user_id = ? AND stripe_customer_id != ''", userID).First(&subscription).Error; err == nil {
		return subscription.StripeCustomerID, nil
	}

	// Create new Stripe customer
	params := &stripe.CustomerParams{
		Metadata: map[string]string{
			"user_id": strconv.Itoa(int(userID)),
		},
	}

	stripeCustomer, err := customer.New(params)
	if err != nil {
		return "", err
	}

	return stripeCustomer.ID, nil
}