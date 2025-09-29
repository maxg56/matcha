package services

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/matcha/api/paiements-service/src/models"
	"github.com/matcha/api/paiements-service/src/conf"
	"github.com/stripe/stripe-go/v76"
	"gorm.io/gorm"
)

// SubscriptionService gère les abonnements utilisateurs
type SubscriptionService struct {
	stripeService *StripeService
}

// NewSubscriptionService crée une nouvelle instance du service d'abonnement
func NewSubscriptionService() *SubscriptionService {
	return &SubscriptionService{
		stripeService: NewStripeService(),
	}
}

// CreateCheckoutSession crée une session de checkout Stripe
func (s *SubscriptionService) CreateCheckoutSession(userID uint, userEmail string, planType models.PlanType) (*stripe.CheckoutSession, error) {
	// Vérifier si l'utilisateur existe
	var user models.User
	if err := conf.DB.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	// Vérifier si l'utilisateur a déjà un abonnement actif
	var existingSubscription models.Subscription
	err := conf.DB.Where("user_id = ? AND status = ?", userID, models.StatusActive).First(&existingSubscription).Error
	if err == nil {
		return nil, errors.New("user already has an active subscription")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to check existing subscription: %w", err)
	}
	// Si err == gorm.ErrRecordNotFound, c'est normal - l'utilisateur n'a pas d'abonnement actif

	// Créer une session de checkout Stripe
	session, err := s.stripeService.CreateCheckoutSession(userID, planType, userEmail)
	if err != nil {
		return nil, fmt.Errorf("failed to create checkout session: %w", err)
	}

	log.Printf("Created checkout session %s for user %d", session.ID, userID)
	return session, nil
}

// CreateSubscription crée un nouvel abonnement
func (s *SubscriptionService) CreateSubscription(userID uint, userEmail string, planType models.PlanType) (*models.Subscription, error) {
	// Vérifier si l'utilisateur existe
	var user models.User
	if err := conf.DB.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	// Vérifier si l'utilisateur a déjà un abonnement actif
	var existingSubscription models.Subscription
	err := conf.DB.Where("user_id = ? AND status = ?", userID, models.StatusActive).First(&existingSubscription).Error
	if err == nil {
		return nil, errors.New("user already has an active subscription")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to check existing subscription: %w", err)
	}

	// Créer une session de checkout Stripe
	session, err := s.stripeService.CreateCheckoutSession(userID, planType, userEmail)
	if err != nil {
		return nil, fmt.Errorf("failed to create checkout session: %w", err)
	}

	log.Printf("Created checkout session for user %d: %s", userID, session.URL)

	// L'abonnement sera créé via webhook une fois le paiement confirmé
	return nil, nil
}

// CreateSubscriptionFromStripe crée un abonnement à partir des données Stripe
func (s *SubscriptionService) CreateSubscriptionFromStripe(stripeSubscription *stripe.Subscription) (*models.Subscription, error) {
	// Extraire l'ID utilisateur des métadonnées
	userIDStr, exists := stripeSubscription.Metadata["user_id"]
	if !exists {
		return nil, errors.New("user_id not found in subscription metadata")
	}

	var userID uint
	if _, err := fmt.Sscanf(userIDStr, "%d", &userID); err != nil {
		return nil, fmt.Errorf("invalid user_id in metadata: %w", err)
	}

	// Déterminer le type de plan
	planType := models.PlanMensuel // Par défaut
	if len(stripeSubscription.Items.Data) > 0 {
		priceID := stripeSubscription.Items.Data[0].Price.ID
		planType = ConvertStripePlanType(priceID)
	}

	// Créer l'abonnement
	subscription := &models.Subscription{
		UserID:               userID,
		StripeSubscriptionID: stripeSubscription.ID,
		StripeCustomerID:     stripeSubscription.Customer.ID,
		PlanType:             planType,
		Status:               ConvertStripeStatus(stripeSubscription.Status),
		CurrentPeriodStart:   timeFromTimestamp(stripeSubscription.CurrentPeriodStart),
		CurrentPeriodEnd:     timeFromTimestamp(stripeSubscription.CurrentPeriodEnd),
		CancelAtPeriodEnd:    stripeSubscription.CancelAtPeriodEnd,
	}

	// Gérer les essais gratuits
	if stripeSubscription.TrialStart != 0 {
		subscription.TrialStart = timeFromTimestamp(stripeSubscription.TrialStart)
	}
	if stripeSubscription.TrialEnd != 0 {
		subscription.TrialEnd = timeFromTimestamp(stripeSubscription.TrialEnd)
	}

	// Sauvegarder en base
	if err := conf.DB.Create(subscription).Error; err != nil {
		return nil, fmt.Errorf("failed to create subscription: %w", err)
	}

	// Mettre à jour le statut premium de l'utilisateur
	if err := s.updateUserPremiumStatus(userID, subscription.IsPremiumValid()); err != nil {
		log.Printf("Failed to update user premium status: %v", err)
	}

	log.Printf("Created subscription %d for user %d", subscription.ID, userID)
	return subscription, nil
}

// UpdateSubscriptionFromStripe met à jour un abonnement à partir des données Stripe
func (s *SubscriptionService) UpdateSubscriptionFromStripe(stripeSubscription *stripe.Subscription) (*models.Subscription, error) {
	var subscription models.Subscription
	if err := conf.DB.Where("stripe_subscription_id = ?", stripeSubscription.ID).First(&subscription).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// L'abonnement n'existe pas, le créer
			return s.CreateSubscriptionFromStripe(stripeSubscription)
		}
		return nil, fmt.Errorf("failed to find subscription: %w", err)
	}

	// Mettre à jour les champs
	subscription.Status = ConvertStripeStatus(stripeSubscription.Status)
	subscription.CurrentPeriodStart = timeFromTimestamp(stripeSubscription.CurrentPeriodStart)
	subscription.CurrentPeriodEnd = timeFromTimestamp(stripeSubscription.CurrentPeriodEnd)
	subscription.CancelAtPeriodEnd = stripeSubscription.CancelAtPeriodEnd

	// Gérer l'annulation
	if stripeSubscription.CanceledAt != 0 {
		canceledAt := ConvertTimestamp(stripeSubscription.CanceledAt)
		subscription.CanceledAt = &canceledAt
	}

	// Sauvegarder les modifications
	if err := conf.DB.Save(&subscription).Error; err != nil {
		return nil, fmt.Errorf("failed to update subscription: %w", err)
	}

	// Mettre à jour le statut premium de l'utilisateur
	if err := s.updateUserPremiumStatus(subscription.UserID, subscription.IsPremiumValid()); err != nil {
		log.Printf("Failed to update user premium status: %v", err)
	}

	log.Printf("Updated subscription %d for user %d", subscription.ID, subscription.UserID)
	return &subscription, nil
}

// CancelSubscription annule un abonnement
func (s *SubscriptionService) CancelSubscription(userID uint, atPeriodEnd bool) error {
	// Récupérer l'abonnement de l'utilisateur
	var subscription models.Subscription
	if err := conf.DB.Where("user_id = ? AND status = ?", userID, models.StatusActive).First(&subscription).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("no active subscription found")
		}
		return fmt.Errorf("failed to find subscription: %w", err)
	}

	// Annuler l'abonnement dans Stripe
	_, err := s.stripeService.CancelSubscription(subscription.StripeSubscriptionID, atPeriodEnd)
	if err != nil {
		return fmt.Errorf("failed to cancel Stripe subscription: %w", err)
	}

	// Mettre à jour l'abonnement local
	subscription.CancelAtPeriodEnd = atPeriodEnd
	if !atPeriodEnd {
		subscription.Status = models.StatusCanceled
		now := time.Now()
		subscription.CanceledAt = &now
	}

	if err := conf.DB.Save(&subscription).Error; err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	// Mettre à jour le statut premium si l'annulation est immédiate
	if !atPeriodEnd {
		if err := s.updateUserPremiumStatus(userID, false); err != nil {
			log.Printf("Failed to update user premium status: %v", err)
		}
	}

	log.Printf("Canceled subscription for user %d (at period end: %t)", userID, atPeriodEnd)
	return nil
}

// GetUserSubscription récupère l'abonnement d'un utilisateur
func (s *SubscriptionService) GetUserSubscription(userID uint) (*models.Subscription, error) {
	var subscription models.Subscription
	if err := conf.DB.Where("user_id = ?", userID).First(&subscription).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Pas d'abonnement
		}
		return nil, fmt.Errorf("failed to get subscription: %w", err)
	}

	return &subscription, nil
}

// GetUserPremiumInfo récupère les informations premium d'un utilisateur
func (s *SubscriptionService) GetUserPremiumInfo(userID uint) (*models.UserPremiumInfo, error) {
	var user models.User
	if err := conf.DB.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	info := user.GetPremiumInfo()
	return &info, nil
}

// CreateBillingPortalSession crée une session du portail de facturation
func (s *SubscriptionService) CreateBillingPortalSession(userID uint, returnURL string) (string, error) {
	// Récupérer l'abonnement de l'utilisateur
	subscription, err := s.GetUserSubscription(userID)
	if err != nil {
		return "", err
	}

	if subscription == nil {
		return "", errors.New("no subscription found")
	}

	// Créer la session du portail de facturation
	session, err := s.stripeService.CreateBillingPortalSession(subscription.StripeCustomerID, returnURL)
	if err != nil {
		return "", fmt.Errorf("failed to create billing portal session: %w", err)
	}

	return session.URL, nil
}

// updateUserPremiumStatus met à jour le statut premium d'un utilisateur
func (s *SubscriptionService) updateUserPremiumStatus(userID uint, isPremium bool) error {
	var premiumTime time.Time
	if isPremium {
		// Définir une date future pour indiquer le premium
		premiumTime = time.Now().AddDate(1, 0, 0) // +1 an
	} else {
		// Définir une date passée pour indiquer la fin du premium
		premiumTime = time.Now().AddDate(-1, 0, 0) // -1 an
	}

	return conf.DB.Model(&models.User{}).Where("id = ?", userID).Update("premium", premiumTime).Error
}

// timeFromTimestamp convertit un timestamp Unix en pointeur vers time.Time
func timeFromTimestamp(timestamp int64) *time.Time {
	if timestamp == 0 {
		return nil
	}
	t := time.Unix(timestamp, 0)
	return &t
}