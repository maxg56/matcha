package models

import (
	"time"
)

// UserPreference stores the learned preference vector for a user
type UserPreference struct {
	ID                  uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID              uint      `gorm:"column:user_id;not null;index" json:"user_id"`
	Age                 float64   `gorm:"column:age;default:0.5" json:"age"`
	Height              float64   `gorm:"column:height;default:0.5" json:"height"`
	Fame                float64   `gorm:"column:fame;default:0.5" json:"fame"`
	AlcoholConsumption  float64   `gorm:"column:alcohol_consumption;default:0.5" json:"alcohol_consumption"`
	Smoking             float64   `gorm:"column:smoking;default:0.5" json:"smoking"`
	Cannabis            float64   `gorm:"column:cannabis;default:0.5" json:"cannabis"`
	Drugs               float64   `gorm:"column:drugs;default:0.5" json:"drugs"`
	Pets                float64   `gorm:"column:pets;default:0.5" json:"pets"`
	SocialActivityLevel float64   `gorm:"column:social_activity_level;default:0.5" json:"social_activity_level"`
	SportActivity       float64   `gorm:"column:sport_activity;default:0.5" json:"sport_activity"`
	EducationLevel      float64   `gorm:"column:education_level;default:0.5" json:"education_level"`
	Religion            float64   `gorm:"column:religion;default:0.5" json:"religion"`
	ChildrenStatus      float64   `gorm:"column:children_status;default:0.5" json:"children_status"`
	PoliticalView       float64   `gorm:"column:political_view;default:0.5" json:"political_view"`
	Latitude            float64   `gorm:"column:latitude;default:0.5" json:"latitude"`
	Longitude           float64   `gorm:"column:longitude;default:0.5" json:"longitude"`
	UpdateCount         int       `gorm:"column:update_count;default:0" json:"update_count"`
	CreatedAt           time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt           time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (UserPreference) TableName() string {
	return "user_preferences"
}