package models

import "time"

// Notification represents a notification sent to a user
type Notification struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	ToUserID  uint      `gorm:"column:to_user_id;not null" json:"to_user_id"`
	NotifType string    `gorm:"column:notif_type;not null;size:10" json:"notif_type"`
	Msg       string    `gorm:"column:msg;not null" json:"msg"`
	Time      time.Time `gorm:"column:time;default:CURRENT_TIMESTAMP" json:"time"`

	// Relations
	ToUser User `gorm:"foreignKey:ToUserID;references:ID"`
}

func (Notification) TableName() string { return "notifications" }