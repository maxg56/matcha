package models

import "time"

// UserPreference represents matching preferences for a user
type UserPreference struct {
	ID               uint    `gorm:"primaryKey;column:id" json:"id"`
	UserID           int     `gorm:"column:user_id;not null;uniqueIndex" json:"user_id"` // Changed to int
	AgeMin           int     `gorm:"column:age_min;default:18" json:"age_min"`
	AgeMax           int     `gorm:"column:age_max;default:99" json:"age_max"`
	MaxDistance      float64 `gorm:"column:max_distance;default:50" json:"max_distance"`
	MinFame          int     `gorm:"column:min_fame;default:0" json:"min_fame"`
	PreferredGenders string  `gorm:"column:preferred_genders;not null" json:"preferred_genders"` // JSON array of genders
	RequiredTags     string  `gorm:"column:required_tags" json:"required_tags"`                  // JSON array of tag names
	BlockedTags      string  `gorm:"column:blocked_tags" json:"blocked_tags"`                    // JSON array of tag names

	// Lifestyle preferences
	SmokingPreference        *string `gorm:"column:smoking_preference" json:"smoking_preference"`               // "any", "smoker", "non_smoker"
	AlcoholPreference        *string `gorm:"column:alcohol_preference" json:"alcohol_preference"`               // "any", "drinker", "non_drinker"
	DrugsPreference          *string `gorm:"column:drugs_preference" json:"drugs_preference"`                   // "any", "user", "non_user"
	CannabisPreference       *string `gorm:"column:cannabis_preference" json:"cannabis_preference"`             // "any", "user", "non_user"

	// Religious preferences
	ReligionPreference       *string `gorm:"column:religion_preference" json:"religion_preference"`             // "any", "same", "different"
	BlockedReligions         string  `gorm:"column:blocked_religions" json:"blocked_religions"`                 // JSON array of blocked religions

	CreatedAt        time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt        time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`

	// Relations
	User User `gorm:"foreignKey:UserID;references:ID"`
}

func (UserPreference) TableName() string { return "user_matching_preferences" }