package models

import (
	"time"
	"gorm.io/gorm"
)

// SubscriptionStatus représente les statuts possibles d'un abonnement
type SubscriptionStatus string

const (
	StatusActive   SubscriptionStatus = "active"
	StatusInactive SubscriptionStatus = "inactive"
	StatusCanceled SubscriptionStatus = "canceled"
	StatusPastDue  SubscriptionStatus = "past_due"
	StatusUnpaid   SubscriptionStatus = "unpaid"
)

// PlanType représente les types de plans disponibles
type PlanType string

const (
	PlanMensuel PlanType = "mensuel"
	PlanAnnuel  PlanType = "annuel"
)

// Subscription représente un abonnement utilisateur
type Subscription struct {
	ID                   uint                `gorm:"primaryKey" json:"id"`
	UserID               uint                `gorm:"not null;uniqueIndex" json:"user_id"`
	StripeSubscriptionID string              `gorm:"type:varchar(255);unique;not null" json:"stripe_subscription_id"`
	StripeCustomerID     string              `gorm:"type:varchar(255);not null" json:"stripe_customer_id"`
	PlanType             PlanType            `gorm:"type:varchar(20);not null" json:"plan_type"`
	Status               SubscriptionStatus  `gorm:"type:varchar(20);not null;default:inactive" json:"status"`
	CurrentPeriodStart   *time.Time          `json:"current_period_start"`
	CurrentPeriodEnd     *time.Time          `json:"current_period_end"`
	CancelAtPeriodEnd    bool                `gorm:"default:false" json:"cancel_at_period_end"`
	CanceledAt           *time.Time          `json:"canceled_at"`
	TrialStart           *time.Time          `json:"trial_start"`
	TrialEnd             *time.Time          `json:"trial_end"`
	CreatedAt            time.Time           `json:"created_at"`
	UpdatedAt            time.Time           `json:"updated_at"`

	// Relations
	Payments []Payment `gorm:"foreignKey:SubscriptionID" json:"payments,omitempty"`
}

// TableName spécifie le nom de la table pour GORM
func (Subscription) TableName() string {
	return "subscriptions"
}

// IsActive vérifie si l'abonnement est actif
func (s *Subscription) IsActive() bool {
	return s.Status == StatusActive &&
		   s.CurrentPeriodEnd != nil &&
		   s.CurrentPeriodEnd.After(time.Now())
}

// IsPremiumValid vérifie si le premium est valide
func (s *Subscription) IsPremiumValid() bool {
	return s.IsActive() || s.IsTrialActive()
}

// IsTrialActive vérifie si l'essai gratuit est actif
func (s *Subscription) IsTrialActive() bool {
	if s.TrialStart == nil || s.TrialEnd == nil {
		return false
	}
	now := time.Now()
	return now.After(*s.TrialStart) && now.Before(*s.TrialEnd)
}

// BeforeCreate hook appelé avant la création
func (s *Subscription) BeforeCreate(tx *gorm.DB) error {
	now := time.Now()
	s.CreatedAt = now
	s.UpdatedAt = now
	return nil
}

// BeforeUpdate hook appelé avant la mise à jour
func (s *Subscription) BeforeUpdate(tx *gorm.DB) error {
	s.UpdatedAt = time.Now()
	return nil
}