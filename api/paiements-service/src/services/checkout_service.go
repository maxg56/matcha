package services

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/matcha/api/paiements-service/src/conf"
	"github.com/matcha/api/paiements-service/src/models"
	"gorm.io/gorm"
)

// CheckoutService gère les sessions de checkout
type CheckoutService struct {
	stripeService *StripeService
}

// NewCheckoutService crée une nouvelle instance du service de checkout
func NewCheckoutService() *CheckoutService {
	return &CheckoutService{
		stripeService: NewStripeService(),
	}
}

// CreateCheckoutSession crée une session de checkout et la stocke en base
func (s *CheckoutService) CreateCheckoutSession(userID uint, planType models.PlanType, userEmail string) (*models.CheckoutSession, error) {
	// Nettoyer les sessions expirées pour cet utilisateur
	s.cleanupExpiredSessions(userID)

	// Vérifier si l'utilisateur n'a pas déjà une session active
	var existingSession models.CheckoutSession
	err := conf.DB.Where("user_id = ? AND status = ?", userID, models.SessionPending).First(&existingSession).Error
	if err == nil {
		// Vérifier si la session n'a pas expiré
		if !existingSession.IsExpired() {
			log.Printf("User %d already has an active checkout session: %s", userID, existingSession.StripeSessionID)
			return &existingSession, nil
		} else {
			// Marquer l'ancienne session comme expirée
			existingSession.MarkAsExpired()
			conf.DB.Save(&existingSession)
		}
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to check existing sessions: %w", err)
	}

	// Créer la session Stripe
	stripeSession, err := s.stripeService.CreateCheckoutSession(userID, planType, userEmail)
	if err != nil {
		return nil, fmt.Errorf("failed to create Stripe session: %w", err)
	}

	// Calculer le montant selon le plan
	amount := s.getAmountForPlan(planType)

	// Créer l'enregistrement de session en base
	checkoutSession := &models.CheckoutSession{
		UserID:          userID,
		StripeSessionID: stripeSession.ID,
		StripeCustomerID: stripeSession.Customer.ID,
		PlanType:        planType,
		Status:          models.SessionPending,
		Amount:          amount,
		Currency:        "eur",
		SuccessURL:      stripeSession.SuccessURL,
		CancelURL:       stripeSession.CancelURL,
		ExpiresAt:       timeFromTimestampCheckout(stripeSession.ExpiresAt),
	}

	if err := conf.DB.Create(checkoutSession).Error; err != nil {
		log.Printf("Failed to save checkout session: %v", err)
		return nil, fmt.Errorf("failed to save checkout session: %w", err)
	}

	log.Printf("✅ Created and stored checkout session %s for user %d (plan: %s)",
		stripeSession.ID, userID, planType)

	return checkoutSession, nil
}

// GetSessionByStripeID récupère une session par son ID Stripe
func (s *CheckoutService) GetSessionByStripeID(stripeSessionID string) (*models.CheckoutSession, error) {
	var session models.CheckoutSession
	if err := conf.DB.Where("stripe_session_id = ?", stripeSessionID).First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("checkout session not found: %s", stripeSessionID)
		}
		return nil, fmt.Errorf("failed to get checkout session: %w", err)
	}
	return &session, nil
}

// CompleteSession marque une session comme complétée et lie l'abonnement
func (s *CheckoutService) CompleteSession(stripeSessionID string, subscriptionID string) error {
	session, err := s.GetSessionByStripeID(stripeSessionID)
	if err != nil {
		return err
	}

	if session.Status != models.SessionPending {
		log.Printf("⚠️  Session %s is not pending (status: %s)", stripeSessionID, session.Status)
		return nil // Pas d'erreur car peut-être déjà traité
	}

	session.MarkAsCompleted(subscriptionID)

	if err := conf.DB.Save(session).Error; err != nil {
		return fmt.Errorf("failed to update session status: %w", err)
	}

	log.Printf("✅ Session %s marked as completed with subscription %s", stripeSessionID, subscriptionID)
	return nil
}

// ValidateSessionForUser vérifie qu'une session appartient bien à un utilisateur
func (s *CheckoutService) ValidateSessionForUser(stripeSessionID string, userID uint) bool {
	var session models.CheckoutSession
	err := conf.DB.Where("stripe_session_id = ? AND user_id = ?", stripeSessionID, userID).First(&session).Error
	return err == nil
}

// CleanupExpiredSessions marque les sessions expirées
func (s *CheckoutService) CleanupExpiredSessions() error {
	now := time.Now()

	result := conf.DB.Model(&models.CheckoutSession{}).
		Where("status = ? AND expires_at < ?", models.SessionPending, now).
		Updates(map[string]interface{}{
			"status":     models.SessionExpired,
			"updated_at": now,
		})

	if result.Error != nil {
		return fmt.Errorf("failed to cleanup expired sessions: %w", result.Error)
	}

	if result.RowsAffected > 0 {
		log.Printf("🧹 Cleaned up %d expired checkout sessions", result.RowsAffected)
	}

	return nil
}

// getAmountForPlan retourne le montant en centimes pour un plan donné
func (s *CheckoutService) getAmountForPlan(planType models.PlanType) int64 {
	switch planType {
	case models.PlanMensuel:
		return 999  // 9.99€
	case models.PlanAnnuel:
		return 9999 // 99.99€
	default:
		return 999
	}
}

// timeFromTimestampCheckout convertit un timestamp Unix en pointeur vers time.Time
func timeFromTimestampCheckout(timestamp int64) *time.Time {
	if timestamp == 0 {
		return nil
	}
	t := time.Unix(timestamp, 0)
	return &t
}

// cleanupExpiredSessions nettoie les sessions expirées pour un utilisateur
func (s *CheckoutService) cleanupExpiredSessions(userID uint) {
	// Marquer comme expirées toutes les sessions qui ont dépassé leur date d'expiration
	result := conf.DB.Model(&models.CheckoutSession{}).
		Where("user_id = ? AND status = ? AND expires_at < ?", userID, models.SessionPending, time.Now()).
		Update("status", models.SessionExpired)

	if result.RowsAffected > 0 {
		log.Printf("Cleaned up %d expired sessions for user %d", result.RowsAffected, userID)
	}
}