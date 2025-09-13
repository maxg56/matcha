package models

import "time"

// PasswordReset represents a password reset token
type PasswordReset struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID    uint      `gorm:"column:user_id;not null" json:"user_id"`
	Token     string    `gorm:"column:token;not null;uniqueIndex" json:"token"`
	ExpiresAt time.Time `gorm:"column:expires_at;not null" json:"expires_at"`
	Used      bool      `gorm:"column:used;default:false" json:"used"`
	CreatedAt time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`

	// Association
	User Users `gorm:"foreignKey:UserID" json:"-"`
}

func (PasswordReset) TableName() string { return "password_resets" }