package models

import "time"

type Match struct {
	ID       uint      `gorm:"primaryKey;column:id" json:"id"`
	User1ID  uint      `gorm:"column:user1_id;not null;index" json:"user1_id"`
	User2ID  uint      `gorm:"column:user2_id;not null;index" json:"user2_id"`
	IsActive bool      `gorm:"column:is_active;default:true" json:"is_active"`
	CreatedAt time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`

	// Relationships
	User1 User `gorm:"foreignKey:User1ID" json:"user1,omitempty"`
	User2 User `gorm:"foreignKey:User2ID" json:"user2,omitempty"`
}

func (Match) TableName() string {
	return "matches"
}