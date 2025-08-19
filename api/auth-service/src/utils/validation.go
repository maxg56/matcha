package utils

import (
	"fmt"
	"time"

	db "auth-service/src/conf"
	models "auth-service/src/models"
	"gorm.io/gorm"
)

// CheckUsernameAvailability checks if a username is available
func CheckUsernameAvailability(username string) (bool, error) {
	var user models.Users
	err := db.DB.Where("username = ?", username).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return true, nil
		}
		return false, fmt.Errorf("database error: %w", err)
	}
	return false, nil
}

// CheckEmailAvailability checks if an email is available
func CheckEmailAvailability(email string) (bool, error) {
	var user models.Users
	err := db.DB.Where("email = ?", email).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return true, nil
		}
		return false, fmt.Errorf("database error: %w", err)
	}
	return false, nil
}


// ParseDate parses date string in YYYY-MM-DD format
func ParseDate(dateStr string) (time.Time, error) {
	return time.Parse("2006-01-02", dateStr)
}

// CalculateAge calculates age from birth date
func CalculateAge(birthDate time.Time) int {
	now := time.Now()
	age := now.Year() - birthDate.Year()
	if now.YearDay() < birthDate.YearDay() {
		age--
	}
	return age
}