package models

import "time"

type Image struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID    uint      `gorm:"column:user_id;not null;index" json:"user_id"`
	Path      string    `gorm:"column:path;not null" json:"path"`
	IsMain    bool      `gorm:"column:is_main;default:false" json:"is_main"`
	CreatedAt time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (Image) TableName() string {
	return "images"
}