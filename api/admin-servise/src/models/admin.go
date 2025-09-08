package models

import (
	"time"
)

type AdminRole string

const (
	RoleSuperAdmin AdminRole = "super_admin"
	RoleAdmin      AdminRole = "admin"
	RoleModerator  AdminRole = "moderator"
)

type Admin struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	Email     string    `gorm:"uniqueIndex;column:email;not null" json:"email"`
	Password  string    `gorm:"column:password_hash;not null" json:"-"`
	Role      string    `gorm:"column:role;type:varchar(32);not null;default:'admin'" json:"role"`
	Active    bool      `gorm:"column:active;default:true" json:"active"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (Admin) TableName() string { return "admins" }
