package models

import (
	"time"
)

// Subscription represents a user's subscription status
type Subscription struct {
	ID                  uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID              uint      `gorm:"column:user_id;not null;index" json:"user_id"`
	StripeCustomerID    string    `gorm:"column:stripe_customer_id;index" json:"stripe_customer_id"`
	StripeSubscriptionID string   `gorm:"column:stripe_subscription_id;uniqueIndex" json:"stripe_subscription_id"`
	Status              string    `gorm:"column:status;not null" json:"status"` // active, canceled, incomplete, etc.
	Plan                string    `gorm:"column:plan;not null" json:"plan"` // mensuel, annuel
	CurrentPeriodStart  time.Time `gorm:"column:current_period_start" json:"current_period_start"`
	CurrentPeriodEnd    time.Time `gorm:"column:current_period_end" json:"current_period_end"`
	CancelAtPeriodEnd   bool      `gorm:"column:cancel_at_period_end;default:false" json:"cancel_at_period_end"`
	CreatedAt           time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt           time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (Subscription) TableName() string { return "subscriptions" }

// IsActive checks if the subscription is currently active
func (s *Subscription) IsActive() bool {
	return s.Status == "active" && time.Now().Before(s.CurrentPeriodEnd)
}