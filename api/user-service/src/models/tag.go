package models

import "time"

// Tag represents user interest tags
type Tag struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	Name      string    `gorm:"column:name;uniqueIndex;not null" json:"name"`
	CreatedAt time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (Tag) TableName() string { return "tags" }
