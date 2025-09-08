package models

import "time"

type Message struct {
	ID       uint      `gorm:"primaryKey;column:id" json:"id"`
	ConvID   uint      `gorm:"column:conv_id;not null" json:"conv_id"`
	SenderID uint      `gorm:"column:sender_id;not null" json:"sender_id"`
	Msg      string    `gorm:"column:msg;type:text;not null" json:"msg"`
	Time     time.Time `gorm:"column:time;autoCreateTime" json:"time"`
	ReadAt   *time.Time `gorm:"column:read_at" json:"read_at"`
}

func (Message) TableName() string {
	return "messages"
}

type MessageRequest struct {
	ConversationID uint   `json:"conversation_id" binding:"required"`
	Message        string `json:"message" binding:"required"`
}