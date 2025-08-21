package models

import "time"

// EmailVerification represents an email verification record
type EmailVerification struct {
	ID               uint      `gorm:"primaryKey"`
	Email            string    `gorm:"type:varchar(255);not null;index"`
	VerificationCode string    `gorm:"type:varchar(6);not null"`
	ExpiresAt        time.Time `gorm:"not null"`
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

func (EmailVerification) TableName() string { return "email_verifications" }