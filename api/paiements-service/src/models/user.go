package models

import (
	"time"
)

// User représente un utilisateur (simplifié pour le service paiements)
type User struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	Username string    `gorm:"type:varchar(255);unique;not null" json:"username"`
	Email    string    `gorm:"type:varchar(255);unique;not null" json:"email"`
	Premium  time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"premium"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	Subscription *Subscription `gorm:"foreignKey:UserID" json:"subscription,omitempty"`
	Payments     []Payment     `gorm:"foreignKey:UserID" json:"payments,omitempty"`
}

// TableName spécifie le nom de la table pour GORM
func (User) TableName() string {
	return "users"
}

// HasActivePremium vérifie si l'utilisateur a un abonnement premium actif
func (u *User) HasActivePremium() bool {
	if u.Subscription == nil {
		return false
	}
	return u.Subscription.IsPremiumValid()
}

// GetPremiumEndDate retourne la date de fin du premium
func (u *User) GetPremiumEndDate() *time.Time {
	if u.Subscription == nil {
		return nil
	}
	return u.Subscription.CurrentPeriodEnd
}

// UserPremiumInfo représente les informations premium d'un utilisateur
type UserPremiumInfo struct {
	UserID           uint       `json:"user_id"`
	HasPremium       bool       `json:"has_premium"`
	PlanType         *string    `json:"plan_type"`
	Status           *string    `json:"status"`
	CurrentPeriodEnd *time.Time `json:"current_period_end"`
	CancelAtPeriodEnd bool      `json:"cancel_at_period_end"`
}

// GetPremiumInfo retourne les informations premium de l'utilisateur
func (u *User) GetPremiumInfo() UserPremiumInfo {
	info := UserPremiumInfo{
		UserID:     u.ID,
		HasPremium: u.HasActivePremium(),
	}

	if u.Subscription != nil {
		planType := string(u.Subscription.PlanType)
		status := string(u.Subscription.Status)
		info.PlanType = &planType
		info.Status = &status
		info.CurrentPeriodEnd = u.Subscription.CurrentPeriodEnd
		info.CancelAtPeriodEnd = u.Subscription.CancelAtPeriodEnd
	}

	return info
}