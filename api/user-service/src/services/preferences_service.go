package services

import (
	"fmt"
	"user-service/src/conf"
	"user-service/src/models"
	"user-service/src/utils"
)

// CreateDefaultPreferencesForUser creates default preferences for a newly registered user
func CreateDefaultPreferencesForUser(userID int, userAge int, sexPref string) error {
	// Check if preferences already exist
	var existingPreference models.UserPreference
	if err := conf.DB.Where("user_id = ?", userID).First(&existingPreference).Error; err == nil {
		// Preferences already exist, skip creation
		return nil
	}

	// Create smart default preferences
	preference := utils.CreateSmartDefaultPreferences(userID, userAge, sexPref)

	// Save to database
	if err := conf.DB.Create(&preference).Error; err != nil {
		return fmt.Errorf("failed to create default preferences for user %d: %w", userID, err)
	}

	return nil
}

// CreateBasicDefaultPreferencesForUser creates basic default preferences (fallback)
func CreateBasicDefaultPreferencesForUser(userID int, sexPref string) error {
	// Check if preferences already exist
	var existingPreference models.UserPreference
	if err := conf.DB.Where("user_id = ?", userID).First(&existingPreference).Error; err == nil {
		// Preferences already exist, skip creation
		return nil
	}

	// Create basic default preferences
	preference := utils.CreateDefaultUserPreferences(userID, sexPref)

	// Save to database
	if err := conf.DB.Create(&preference).Error; err != nil {
		return fmt.Errorf("failed to create basic default preferences for user %d: %w", userID, err)
	}

	return nil
}