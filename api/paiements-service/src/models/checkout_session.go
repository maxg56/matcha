package models

import (
	"time"
)

// CheckoutSessionStatus représente les statuts possibles d'une session de checkout
type CheckoutSessionStatus string

const (
	SessionPending   CheckoutSessionStatus = "pending"    // Session créée, en attente de paiement
	SessionCompleted CheckoutSessionStatus = "completed"  // Paiement réussi
	SessionExpired   CheckoutSessionStatus = "expired"    // Session expirée
	SessionCanceled  CheckoutSessionStatus = "canceled"   // Annulée par l'utilisateur
)

// CheckoutSession représente une session de checkout Stripe
type CheckoutSession struct {
	ID                    uint                  `gorm:"primaryKey" json:"id"`
	UserID                uint                  `gorm:"not null;index" json:"user_id"`
	StripeSessionID       string                `gorm:"type:varchar(255);unique;not null" json:"stripe_session_id"`
	StripeCustomerID      string                `gorm:"type:varchar(255)" json:"stripe_customer_id"`
	PlanType              PlanType              `gorm:"type:varchar(20);not null" json:"plan_type"`
	Status                CheckoutSessionStatus `gorm:"type:varchar(20);not null;default:pending" json:"status"`
	Amount                int64                 `gorm:"not null" json:"amount"`           // Montant en centimes
	Currency              string                `gorm:"type:varchar(3);not null" json:"currency"`
	SuccessURL            string                `gorm:"type:text" json:"success_url"`
	CancelURL             string                `gorm:"type:text" json:"cancel_url"`
	ExpiresAt             *time.Time            `json:"expires_at"`
	CompletedAt           *time.Time            `json:"completed_at"`
	StripeSubscriptionID  string                `gorm:"type:varchar(255)" json:"stripe_subscription_id"` // Rempli après création de l'abonnement
	CreatedAt             time.Time             `json:"created_at"`
	UpdatedAt             time.Time             `json:"updated_at"`

	// Relations
	User         *User         `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Subscription *Subscription `gorm:"foreignKey:StripeSubscriptionID;references:StripeSubscriptionID" json:"subscription,omitempty"`
}

// TableName spécifie le nom de la table pour GORM
func (CheckoutSession) TableName() string {
	return "checkout_sessions"
}

// IsExpired vérifie si la session a expiré
func (cs *CheckoutSession) IsExpired() bool {
	if cs.ExpiresAt == nil {
		return false
	}
	return time.Now().After(*cs.ExpiresAt)
}

// MarkAsCompleted marque la session comme complétée
func (cs *CheckoutSession) MarkAsCompleted(subscriptionID string) {
	now := time.Now()
	cs.Status = SessionCompleted
	cs.CompletedAt = &now
	cs.StripeSubscriptionID = subscriptionID
	cs.UpdatedAt = now
}

// MarkAsExpired marque la session comme expirée
func (cs *CheckoutSession) MarkAsExpired() {
	cs.Status = SessionExpired
	cs.UpdatedAt = time.Now()
}