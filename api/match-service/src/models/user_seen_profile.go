package models

import (
	"time"
)

// UserSeenProfile tracks which profiles a user has already seen
type UserSeenProfile struct {
	ID          uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID      uint      `gorm:"column:user_id;not null;index" json:"user_id"`
	SeenUserID  uint      `gorm:"column:seen_user_id;not null;index" json:"seen_user_id"`
	SeenAt      time.Time `gorm:"column:seen_at;default:CURRENT_TIMESTAMP" json:"seen_at"`
	AlgorithmType string  `gorm:"column:algorithm_type" json:"algorithm_type"`
}

func (UserSeenProfile) TableName() string {
	return "user_seen_profiles"
}