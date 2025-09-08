package models

import "time"

type UserInteraction struct {
	ID              uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID          uint      `gorm:"column:user_id;not null;index" json:"user_id"`
	TargetUserID    uint      `gorm:"column:target_user_id;not null;index" json:"target_user_id"`
	InteractionType string    `gorm:"column:interaction_type;not null" json:"interaction_type"` // 'like', 'pass', 'block'
	CreatedAt       time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`

	// Relationships
	User       User `gorm:"foreignKey:UserID" json:"user,omitempty"`
	TargetUser User `gorm:"foreignKey:TargetUserID" json:"target_user,omitempty"`
}

func (UserInteraction) TableName() string {
	return "user_interactions"
}