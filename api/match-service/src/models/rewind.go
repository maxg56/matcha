package models

import "time"

type Rewind struct {
	ID                  uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID              uint      `gorm:"column:user_id;not null;index" json:"user_id"`
	OriginalInteractionID uint    `gorm:"column:original_interaction_id;not null;index" json:"original_interaction_id"`
	RewindType          string    `gorm:"column:rewind_type;not null" json:"rewind_type"` // 'like', 'pass', 'super_like'
	CreatedAt           time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	ExpiresAt           time.Time `gorm:"column:expires_at;not null" json:"expires_at"`
	IsUsed              bool      `gorm:"column:is_used;default:false" json:"is_used"`

	// Relationships
	User                User            `gorm:"foreignKey:UserID" json:"user,omitempty"`
	OriginalInteraction UserInteraction `gorm:"foreignKey:OriginalInteractionID" json:"original_interaction,omitempty"`
}

func (Rewind) TableName() string {
	return "rewinds"
}

type RewindAvailability struct {
	CanRewind           bool      `json:"can_rewind"`
	LastInteractionID   *uint     `json:"last_interaction_id,omitempty"`
	LastInteractionType *string   `json:"last_interaction_type,omitempty"`
	ExpiresAt           *time.Time `json:"expires_at,omitempty"`
	TimeRemaining       *int      `json:"time_remaining,omitempty"` // seconds
	Reason              *string   `json:"reason,omitempty"`
}