package services

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/matcha/api/paiements-service/src/models"
	"github.com/matcha/api/paiements-service/src/conf"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/paymentintent"
	"gorm.io/gorm"
)

// PaymentService gère les paiements
type PaymentService struct{}

// NewPaymentService crée une nouvelle instance du service de paiement
func NewPaymentService() *PaymentService {
	return &PaymentService{}
}

// CreatePaymentFromInvoice crée un enregistrement de paiement à partir d'une facture Stripe
func (s *PaymentService) CreatePaymentFromInvoice(invoice *stripe.Invoice) error {
	// Récupérer l'abonnement associé
	var subscription models.Subscription
	if invoice.Subscription == nil {
		return errors.New("invoice has no associated subscription")
	}

	if err := conf.DB.Where("stripe_subscription_id = ?", invoice.Subscription.ID).First(&subscription).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("subscription not found for ID %s", invoice.Subscription.ID)
		}
		return fmt.Errorf("failed to find subscription: %w", err)
	}

	// Vérifier si le paiement existe déjà
	var existingPayment models.Payment
	if invoice.PaymentIntent != nil {
		err := conf.DB.Where("stripe_payment_intent_id = ?", invoice.PaymentIntent.ID).First(&existingPayment).Error
		if err == nil {
			// Le paiement existe déjà, le mettre à jour
			return s.updatePaymentFromInvoice(&existingPayment, invoice)
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("failed to check existing payment: %w", err)
		}
	}

	// Créer un nouveau paiement
	payment := &models.Payment{
		UserID:         subscription.UserID,
		SubscriptionID: &subscription.ID,
		Amount:         invoice.AmountPaid,
		Currency:       string(invoice.Currency),
		Status:         models.PaymentSucceeded,
	}

	// Ajouter l'ID de la facture
	if invoice.ID != "" {
		payment.StripeInvoiceID = &invoice.ID
	}

	// Ajouter l'ID du PaymentIntent si disponible
	if invoice.PaymentIntent != nil {
		payment.StripePaymentIntentID = invoice.PaymentIntent.ID
	} else {
		// Générer un ID unique basé sur la facture
		payment.StripePaymentIntentID = fmt.Sprintf("invoice_%s", invoice.ID)
	}

	// Déterminer le type de méthode de paiement
	if invoice.PaymentIntent != nil && len(invoice.PaymentIntent.PaymentMethodTypes) > 0 {
		paymentMethodType := invoice.PaymentIntent.PaymentMethodTypes[0]
		payment.PaymentMethodType = &paymentMethodType
	}

	// Sauvegarder le paiement
	if err := conf.DB.Create(payment).Error; err != nil {
		return fmt.Errorf("failed to create payment: %w", err)
	}

	return nil
}

// CreatePaymentFromPaymentIntent crée un enregistrement de paiement à partir d'un PaymentIntent
func (s *PaymentService) CreatePaymentFromPaymentIntent(paymentIntent *stripe.PaymentIntent) error {
	// Vérifier si le paiement existe déjà
	var existingPayment models.Payment
	err := conf.DB.Where("stripe_payment_intent_id = ?", paymentIntent.ID).First(&existingPayment).Error
	if err == nil {
		// Le paiement existe déjà, le mettre à jour
		return s.updatePaymentFromPaymentIntent(&existingPayment, paymentIntent)
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return fmt.Errorf("failed to check existing payment: %w", err)
	}

	// Extraire l'ID utilisateur des métadonnées
	userIDStr, exists := paymentIntent.Metadata["user_id"]
	if !exists {
		return errors.New("user_id not found in payment intent metadata")
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		return fmt.Errorf("invalid user_id in metadata: %w", err)
	}

	// Créer un nouveau paiement
	payment := &models.Payment{
		UserID:                uint(userID),
		StripePaymentIntentID: paymentIntent.ID,
		Amount:                paymentIntent.Amount,
		Currency:              string(paymentIntent.Currency),
		Status:                ConvertPaymentIntentStatus(paymentIntent.Status),
	}

	// Ajouter le type de méthode de paiement
	if len(paymentIntent.PaymentMethodTypes) > 0 {
		paymentMethodType := paymentIntent.PaymentMethodTypes[0]
		payment.PaymentMethodType = &paymentMethodType
	}

	// Ajouter la raison de l'échec si applicable
	if paymentIntent.LastPaymentError != nil {
		message := string(paymentIntent.LastPaymentError.Code)
		payment.FailureReason = &message
	}

	// Sauvegarder le paiement
	if err := conf.DB.Create(payment).Error; err != nil {
		return fmt.Errorf("failed to create payment: %w", err)
	}

	return nil
}

// UpdatePaymentStatus met à jour le statut d'un paiement
func (s *PaymentService) UpdatePaymentStatus(paymentIntentID string, status models.PaymentStatus, failureReason *string) error {
	var payment models.Payment
	if err := conf.DB.Where("stripe_payment_intent_id = ?", paymentIntentID).First(&payment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("payment not found for PaymentIntent %s", paymentIntentID)
		}
		return fmt.Errorf("failed to find payment: %w", err)
	}

	// Mettre à jour le statut
	payment.Status = status
	if failureReason != nil {
		payment.FailureReason = failureReason
	}

	// Sauvegarder les modifications
	if err := conf.DB.Save(&payment).Error; err != nil {
		return fmt.Errorf("failed to update payment: %w", err)
	}

	return nil
}

// GetUserPaymentHistory récupère l'historique des paiements d'un utilisateur
func (s *PaymentService) GetUserPaymentHistory(userID uint, limit int, offset int) ([]models.PaymentSummary, error) {
	var payments []models.Payment
	query := conf.DB.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset)

	if err := query.Find(&payments).Error; err != nil {
		return nil, fmt.Errorf("failed to get payment history: %w", err)
	}

	// Convertir en résumés
	summaries := make([]models.PaymentSummary, len(payments))
	for i, payment := range payments {
		summaries[i] = payment.ToSummary()
	}

	return summaries, nil
}

// GetPaymentStats récupère les statistiques de paiement d'un utilisateur
func (s *PaymentService) GetPaymentStats(userID uint) (*PaymentStats, error) {
	stats := &PaymentStats{}

	// Compter le nombre total de paiements
	if err := conf.DB.Model(&models.Payment{}).Where("user_id = ?", userID).Count(&stats.TotalPayments).Error; err != nil {
		return nil, fmt.Errorf("failed to count payments: %w", err)
	}

	// Compter les paiements réussis
	if err := conf.DB.Model(&models.Payment{}).Where("user_id = ? AND status = ?", userID, models.PaymentSucceeded).Count(&stats.SuccessfulPayments).Error; err != nil {
		return nil, fmt.Errorf("failed to count successful payments: %w", err)
	}

	// Calculer le montant total payé
	var totalAmount int64
	if err := conf.DB.Model(&models.Payment{}).Where("user_id = ? AND status = ?", userID, models.PaymentSucceeded).Select("COALESCE(SUM(amount), 0)").Scan(&totalAmount).Error; err != nil {
		return nil, fmt.Errorf("failed to calculate total amount: %w", err)
	}
	stats.TotalAmountPaid = float64(totalAmount) / 100.0

	// Calculer le taux de réussite
	if stats.TotalPayments > 0 {
		stats.SuccessRate = float64(stats.SuccessfulPayments) / float64(stats.TotalPayments) * 100
	}

	return stats, nil
}

// updatePaymentFromInvoice met à jour un paiement existant à partir d'une facture
func (s *PaymentService) updatePaymentFromInvoice(payment *models.Payment, invoice *stripe.Invoice) error {
	payment.Amount = invoice.AmountPaid
	payment.Status = models.PaymentSucceeded

	if invoice.ID != "" {
		payment.StripeInvoiceID = &invoice.ID
	}

	return conf.DB.Save(payment).Error
}

// updatePaymentFromPaymentIntent met à jour un paiement existant à partir d'un PaymentIntent
func (s *PaymentService) updatePaymentFromPaymentIntent(payment *models.Payment, paymentIntent *stripe.PaymentIntent) error {
	payment.Status = ConvertPaymentIntentStatus(paymentIntent.Status)

	if paymentIntent.LastPaymentError != nil {
		message := string(paymentIntent.LastPaymentError.Code)
		payment.FailureReason = &message
	}

	return conf.DB.Save(payment).Error
}

// PaymentStats représente les statistiques de paiement d'un utilisateur
type PaymentStats struct {
	TotalPayments      int64   `json:"total_payments"`
	SuccessfulPayments int64   `json:"successful_payments"`
	TotalAmountPaid    float64 `json:"total_amount_paid"`
	SuccessRate        float64 `json:"success_rate"`
}

// ConvertPaymentIntentStatus convertit un statut PaymentIntent en statut de paiement interne
func ConvertPaymentIntentStatus(status stripe.PaymentIntentStatus) models.PaymentStatus {
	switch status {
	case stripe.PaymentIntentStatusSucceeded:
		return models.PaymentSucceeded
	case stripe.PaymentIntentStatusCanceled:
		return models.PaymentCanceled
	case stripe.PaymentIntentStatusRequiresPaymentMethod,
		 stripe.PaymentIntentStatusRequiresConfirmation,
		 stripe.PaymentIntentStatusRequiresAction,
		 stripe.PaymentIntentStatusProcessing:
		return models.PaymentPending
	default:
		return models.PaymentFailed
	}
}

// CreateTestPaymentRequest représente une demande de création de paiement de test
type CreateTestPaymentRequest struct {
	Amount            int64                `json:"amount" binding:"required,min=1"`                // Montant en centimes
	Currency          string               `json:"currency"`                                       // Devise (par défaut: eur)
	Status            models.PaymentStatus `json:"status"`                                         // Statut (par défaut: succeeded)
	PaymentMethodType string               `json:"payment_method_type"`                            // Type de méthode de paiement (par défaut: card)
	FailureReason     *string              `json:"failure_reason,omitempty"`                       // Raison de l'échec (si status = failed)
}

// CreateTestPayment crée un paiement de test pour un utilisateur
func (s *PaymentService) CreateTestPayment(userID uint, req CreateTestPaymentRequest) (*models.Payment, error) {
	// Valeurs par défaut
	if req.Currency == "" {
		req.Currency = "eur"
	}
	if req.Status == "" {
		req.Status = models.PaymentSucceeded
	}
	if req.PaymentMethodType == "" {
		req.PaymentMethodType = "card"
	}

	// Vérifier que l'utilisateur existe
	var user models.User
	if err := conf.DB.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	// Générer un ID unique pour le PaymentIntent de test
	testPaymentIntentID := fmt.Sprintf("pi_test_%d_%d", userID, time.Now().Unix())

	// Créer le paiement de test
	payment := &models.Payment{
		UserID:                userID,
		StripePaymentIntentID: testPaymentIntentID,
		Amount:                req.Amount,
		Currency:              req.Currency,
		Status:                req.Status,
		PaymentMethodType:     &req.PaymentMethodType,
		FailureReason:         req.FailureReason,
		CreatedAt:             time.Now(),
	}

	// Valider que si le statut est "failed", une raison d'échec est fournie
	if req.Status == models.PaymentFailed && req.FailureReason == nil {
		defaultReason := "Test payment failure"
		payment.FailureReason = &defaultReason
	}

	// Sauvegarder le paiement
	if err := conf.DB.Create(payment).Error; err != nil {
		return nil, fmt.Errorf("failed to create test payment: %w", err)
	}

	return payment, nil
}

// SyncPaymentsFromStripe synchronise les paiements depuis Stripe pour tous les utilisateurs
func (s *PaymentService) SyncPaymentsFromStripe() (*SyncResult, error) {
	result := &SyncResult{
		ProcessedPayments: 0,
		CreatedPayments:   0,
		UpdatedPayments:   0,
		Errors:           []string{},
	}

	// Récupérer tous les PaymentIntents depuis Stripe (limité aux 100 derniers)
	params := &stripe.PaymentIntentListParams{}
	params.Limit = stripe.Int64(100)

	iter := paymentintent.List(params)
	for iter.Next() {
		pi := iter.PaymentIntent()
		result.ProcessedPayments++

		// Vérifier si le paiement existe déjà
		var existingPayment models.Payment
		err := conf.DB.Where("stripe_payment_intent_id = ?", pi.ID).First(&existingPayment).Error

		if err == nil {
			// Le paiement existe, le mettre à jour si nécessaire
			if s.shouldUpdatePayment(&existingPayment, pi) {
				if err := s.updatePaymentFromPaymentIntent(&existingPayment, pi); err != nil {
					result.Errors = append(result.Errors, fmt.Sprintf("Failed to update payment %s: %v", pi.ID, err))
					continue
				}
				result.UpdatedPayments++
			}
		} else if errors.Is(err, gorm.ErrRecordNotFound) {
			// Le paiement n'existe pas, le créer
			if err := s.CreatePaymentFromPaymentIntent(pi); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("Failed to create payment %s: %v", pi.ID, err))
				continue
			}
			result.CreatedPayments++
		} else {
			result.Errors = append(result.Errors, fmt.Sprintf("Database error for payment %s: %v", pi.ID, err))
		}
	}

	if err := iter.Err(); err != nil {
		result.Errors = append(result.Errors, fmt.Sprintf("Stripe API error: %v", err))
	}

	return result, nil
}

// SyncUserPaymentsFromStripe synchronise les paiements d'un utilisateur spécifique
func (s *PaymentService) SyncUserPaymentsFromStripe(userID uint) (*SyncResult, error) {
	result := &SyncResult{
		ProcessedPayments: 0,
		CreatedPayments:   0,
		UpdatedPayments:   0,
		Errors:           []string{},
	}

	// Paramètres pour rechercher les PaymentIntents avec les métadonnées user_id
	params := &stripe.PaymentIntentListParams{}
	params.Limit = stripe.Int64(100)
	// Note: Stripe ne permet pas de filtrer directement par métadonnées via l'API,
	// nous devons donc récupérer tous les paiements et filtrer côté application

	iter := paymentintent.List(params)
	for iter.Next() {
		pi := iter.PaymentIntent()

		// Vérifier si ce PaymentIntent correspond à notre utilisateur
		if userIDStr, exists := pi.Metadata["user_id"]; !exists || userIDStr != fmt.Sprintf("%d", userID) {
			continue
		}

		result.ProcessedPayments++

		// Vérifier si le paiement existe déjà
		var existingPayment models.Payment
		err := conf.DB.Where("stripe_payment_intent_id = ?", pi.ID).First(&existingPayment).Error

		if err == nil {
			// Le paiement existe, le mettre à jour si nécessaire
			if s.shouldUpdatePayment(&existingPayment, pi) {
				if err := s.updatePaymentFromPaymentIntent(&existingPayment, pi); err != nil {
					result.Errors = append(result.Errors, fmt.Sprintf("Failed to update payment %s: %v", pi.ID, err))
					continue
				}
				result.UpdatedPayments++
			}
		} else if errors.Is(err, gorm.ErrRecordNotFound) {
			// Le paiement n'existe pas, le créer
			if err := s.CreatePaymentFromPaymentIntent(pi); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("Failed to create payment %s: %v", pi.ID, err))
				continue
			}
			result.CreatedPayments++
		} else {
			result.Errors = append(result.Errors, fmt.Sprintf("Database error for payment %s: %v", pi.ID, err))
		}
	}

	if err := iter.Err(); err != nil {
		result.Errors = append(result.Errors, fmt.Sprintf("Stripe API error: %v", err))
	}

	return result, nil
}

// shouldUpdatePayment détermine si un paiement existant doit être mis à jour
func (s *PaymentService) shouldUpdatePayment(existingPayment *models.Payment, pi *stripe.PaymentIntent) bool {
	currentStatus := ConvertPaymentIntentStatus(pi.Status)
	return existingPayment.Status != currentStatus || existingPayment.Amount != pi.Amount
}

// SyncResult représente le résultat d'une synchronisation
type SyncResult struct {
	ProcessedPayments int      `json:"processed_payments"`
	CreatedPayments   int      `json:"created_payments"`
	UpdatedPayments   int      `json:"updated_payments"`
	Errors           []string `json:"errors,omitempty"`
}