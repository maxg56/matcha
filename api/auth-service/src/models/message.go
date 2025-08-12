package models

import "time"

// Message maps to table `messages`
type Message struct {
    ID       uint      `gorm:"primaryKey;column:id" json:"id"`
    ConvID   uint      `gorm:"column:conv_id;not null" json:"conv_id"`
    SenderID uint      `gorm:"column:sender_id;not null" json:"sender_id"`
    Msg      string    `gorm:"column:msg;type:text;not null" json:"msg"`
    Time     time.Time `gorm:"column:time;autoCreateTime" json:"time"`
}

func (Message) TableName() string { return "messages" }
