package models

import (
	"time"
)

// Payment represents a payment transaction
type Payment struct {
	ID                   uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID               uint      `gorm:"column:user_id;not null;index" json:"user_id"`
	SubscriptionID       uint      `gorm:"column:subscription_id;index" json:"subscription_id"`
	StripePaymentIntentID string   `gorm:"column:stripe_payment_intent_id;uniqueIndex" json:"stripe_payment_intent_id"`
	StripeChargeID       string    `gorm:"column:stripe_charge_id;index" json:"stripe_charge_id"`
	Amount               int64     `gorm:"column:amount;not null" json:"amount"` // Amount in cents
	Currency             string    `gorm:"column:currency;not null;default:EUR" json:"currency"`
	Status               string    `gorm:"column:status;not null" json:"status"` // succeeded, pending, failed
	Description          string    `gorm:"column:description" json:"description"`
	CreatedAt            time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt            time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`

	// Relations
	Subscription *Subscription `gorm:"foreignKey:SubscriptionID" json:"subscription,omitempty"`
}

func (Payment) TableName() string { return "payments" }

// FormatAmount returns the amount in euros (for display)
func (p *Payment) FormatAmount() float64 {
	return float64(p.Amount) / 100.0
}