package models

import (
	"time"
	"gorm.io/gorm"
)

// PaymentStatus représente les statuts possibles d'un paiement
type PaymentStatus string

const (
	PaymentPending   PaymentStatus = "pending"
	PaymentSucceeded PaymentStatus = "succeeded"
	PaymentFailed    PaymentStatus = "failed"
	PaymentCanceled  PaymentStatus = "canceled"
)

// Payment représente un paiement effectué par un utilisateur
type Payment struct {
	ID                     uint           `gorm:"primaryKey" json:"id"`
	UserID                 uint           `gorm:"not null;index" json:"user_id"`
	SubscriptionID         *uint          `gorm:"index" json:"subscription_id"`
	StripePaymentIntentID  string         `gorm:"type:varchar(255);unique;not null" json:"stripe_payment_intent_id"`
	StripeInvoiceID        *string        `gorm:"type:varchar(255)" json:"stripe_invoice_id"`
	Amount                 int64          `gorm:"not null" json:"amount"` // Montant en centimes
	Currency               string         `gorm:"type:varchar(3);not null;default:eur" json:"currency"`
	Status                 PaymentStatus  `gorm:"type:varchar(20);not null;default:pending" json:"status"`
	PaymentMethodType      *string        `gorm:"type:varchar(50)" json:"payment_method_type"`
	FailureReason          *string        `gorm:"type:text" json:"failure_reason"`
	CreatedAt              time.Time      `json:"created_at"`

	// Relations
	Subscription *Subscription `gorm:"foreignKey:SubscriptionID" json:"subscription,omitempty"`
}

// TableName spécifie le nom de la table pour GORM
func (Payment) TableName() string {
	return "payments"
}

// GetAmountInEuros retourne le montant en euros
func (p *Payment) GetAmountInEuros() float64 {
	return float64(p.Amount) / 100.0
}

// IsSuccessful vérifie si le paiement a réussi
func (p *Payment) IsSuccessful() bool {
	return p.Status == PaymentSucceeded
}

// BeforeCreate hook appelé avant la création
func (p *Payment) BeforeCreate(tx *gorm.DB) error {
	p.CreatedAt = time.Now()
	return nil
}

// PaymentSummary représente un résumé de paiement pour les APIs
type PaymentSummary struct {
	ID                string    `json:"id"`
	Amount            float64   `json:"amount"`
	Currency          string    `json:"currency"`
	Status            string    `json:"status"`
	PaymentMethodType *string   `json:"payment_method_type"`
	CreatedAt         time.Time `json:"created_at"`
	FailureReason     *string   `json:"failure_reason,omitempty"`
}

// ToSummary convertit un Payment en PaymentSummary
func (p *Payment) ToSummary() PaymentSummary {
	return PaymentSummary{
		ID:                string(rune(p.ID)),
		Amount:            p.GetAmountInEuros(),
		Currency:          p.Currency,
		Status:            string(p.Status),
		PaymentMethodType: p.PaymentMethodType,
		CreatedAt:         p.CreatedAt,
		FailureReason:     p.FailureReason,
	}
}