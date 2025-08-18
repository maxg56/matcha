package models

import "time"

// Image represents user profile images
type Image struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID    uint      `gorm:"column:user_id;not null" json:"user_id"`
	URL       string    `gorm:"column:url;not null" json:"url"`
	IsMain    bool      `gorm:"column:is_main;default:false" json:"is_main"`
	CreatedAt time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`

	// Relations
	User User `gorm:"foreignKey:UserID;references:ID"`
}

func (Image) TableName() string { return "images" }
