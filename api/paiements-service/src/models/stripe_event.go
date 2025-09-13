package models

import (
	"time"
)

// StripeEvent represents a Stripe webhook event for idempotency
type StripeEvent struct {
	ID            uint      `gorm:"primaryKey;column:id" json:"id"`
	StripeEventID string    `gorm:"column:stripe_event_id;uniqueIndex;not null" json:"stripe_event_id"`
	EventType     string    `gorm:"column:event_type;not null" json:"event_type"`
	Processed     bool      `gorm:"column:processed;default:false" json:"processed"`
	ProcessedAt   *time.Time `gorm:"column:processed_at" json:"processed_at"`
	Data          string    `gorm:"column:data;type:text" json:"data"` // JSON data from webhook
	CreatedAt     time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt     time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (StripeEvent) TableName() string { return "stripe_events" }