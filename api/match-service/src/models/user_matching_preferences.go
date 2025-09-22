package models

import (
	"time"
)

// UserMatchingPreferences stores explicit user preferences for matching
type UserMatchingPreferences struct {
	ID               uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID           uint      `gorm:"column:user_id;not null;uniqueIndex" json:"user_id"`
	AgeMin           int       `gorm:"column:age_min;default:18" json:"age_min"`
	AgeMax           int       `gorm:"column:age_max;default:99" json:"age_max"`
	MaxDistance      float64   `gorm:"column:max_distance;default:50" json:"max_distance"`
	MinFame          int       `gorm:"column:min_fame;default:0" json:"min_fame"`
	PreferredGenders string    `gorm:"column:preferred_genders;not null;default:'[\"man\",\"woman\",\"other\"]' " json:"preferred_genders"`
	RequiredTags     string    `gorm:"column:required_tags;default:'[]'" json:"required_tags"`
	BlockedTags      string    `gorm:"column:blocked_tags;default:'[]'" json:"blocked_tags"`
	CreatedAt        time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt        time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (UserMatchingPreferences) TableName() string {
	return "user_matching_preferences"
}