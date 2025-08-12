package models

import "database/sql"

// User maps to table `users`
type User struct {
	ID        uint            `gorm:"primaryKey;column:id" json:"id"`
	Username  string          `gorm:"column:username;uniqueIndex" json:"username"`
	FirstName string          `gorm:"column:first_name" json:"first_name"`
	LastName  string          `gorm:"column:last_name" json:"last_name"`
	Email     string          `gorm:"column:email;uniqueIndex" json:"email"`
	PasswordHash string       `gorm:"column:password_hash" json:"-"`
	Fame      int             `gorm:"column:fame;default:0" json:"fame"`
	Gender    string          `gorm:"column:gender;not null" json:"gender"`
	SexPref   string          `gorm:"column:sex_pref;not null;default:both" json:"sex_pref"`
	Bio       string          `gorm:"column:bio;size:400" json:"bio"`
	Latitude  sql.NullFloat64 `gorm:"column:latitude" json:"latitude"`
	Longitude sql.NullFloat64 `gorm:"column:longitude" json:"longitude"`
}

func (User) TableName() string { return "users" }
