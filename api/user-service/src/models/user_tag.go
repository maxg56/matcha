package models

import "time"

// UserTag represents the many-to-many relationship between users and tags
type UserTag struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID    uint      `gorm:"column:user_id;not null" json:"user_id"`
	TagID     uint      `gorm:"column:tag_id;not null" json:"tag_id"`
	CreatedAt time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`

	// Relations
	User User `gorm:"foreignKey:UserID;references:ID"`
	Tag  Tag  `gorm:"foreignKey:TagID;references:ID"`
}

func (UserTag) TableName() string { return "user_tags" }
