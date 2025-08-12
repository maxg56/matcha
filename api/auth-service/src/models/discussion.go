package models

import "time"

// Discussion maps to table `discussion`
type Discussion struct {
	ID                 uint       `gorm:"primaryKey;column:id" json:"id"`
	User1ID            uint       `gorm:"column:user1_id;not null" json:"user1_id"`
	User2ID            uint       `gorm:"column:user2_id;not null" json:"user2_id"`
	LastMessageContent string     `gorm:"column:last_message_content" json:"last_message_content"`
	LastMessageAt      *time.Time `gorm:"column:last_message_at" json:"last_message_at"`
}

func (Discussion) TableName() string { return "discussion" }
