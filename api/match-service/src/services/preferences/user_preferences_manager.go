package preferences

import (
	"strings"

	"match-service/src/conf"
	"match-service/src/models"
)

// UserPreferencesManager handles user matching preferences
type UserPreferencesManager struct{}

// NewUserPreferencesManager creates a new UserPreferencesManager instance
func NewUserPreferencesManager() *UserPreferencesManager {
	return &UserPreferencesManager{}
}

// GetUserMatchingPreferences retrieves explicit matching preferences for a user
func (m *UserPreferencesManager) GetUserMatchingPreferences(userID int) (*models.UserMatchingPreferences, error) {
	var preferences models.UserMatchingPreferences
	err := conf.DB.Where("user_id = ?", userID).First(&preferences).Error
	if err != nil {
		// Return default preferences if none exist
		return m.getDefaultPreferences(userID), nil
	}
	return &preferences, nil
}

// getDefaultPreferences returns default matching preferences
func (m *UserPreferencesManager) getDefaultPreferences(userID int) *models.UserMatchingPreferences {
	return &models.UserMatchingPreferences{
		UserID:           uint(userID),
		AgeMin:           18,
		AgeMax:           99,
		MaxDistance:      50,
		MinFame:          0,
		PreferredGenders: `["man","woman","other"]`,
		RequiredTags:     "[]",
		BlockedTags:      "[]",
	}
}

// ApplyGenderFilter applies gender preferences to a database query
func (m *UserPreferencesManager) ApplyGenderFilter(query interface{}, preferences *models.UserMatchingPreferences) interface{} {
	// For now, assume query is a GORM query interface
	// In a real implementation, you might want to use a proper query builder interface
	if preferences.PreferredGenders != "" && preferences.PreferredGenders != `["man","woman","other"]` {
		// Parse JSON array - for now, handle basic cases
		if strings.Contains(preferences.PreferredGenders, `"man"`) && !strings.Contains(preferences.PreferredGenders, `"woman"`) {
			// Apply man filter - this would need proper GORM query interface
		} else if strings.Contains(preferences.PreferredGenders, `"woman"`) && !strings.Contains(preferences.PreferredGenders, `"man"`) {
			// Apply woman filter - this would need proper GORM query interface
		}
		// If both or neither are present, don't filter by gender
	}
	return query
}

// HasGenderPreference checks if user has specific gender preferences
func (m *UserPreferencesManager) HasGenderPreference(preferences *models.UserMatchingPreferences, gender string) bool {
	if preferences.PreferredGenders == "" || preferences.PreferredGenders == `["man","woman","other"]` {
		return true // No specific preference, accept all
	}
	return strings.Contains(preferences.PreferredGenders, `"`+gender+`"`)
}

// ValidatePreferences validates user preferences before saving
func (m *UserPreferencesManager) ValidatePreferences(preferences *models.UserMatchingPreferences) error {
	// Add validation logic here
	if preferences.AgeMin < 18 || preferences.AgeMin > 99 {
		preferences.AgeMin = 18
	}
	if preferences.AgeMax < preferences.AgeMin || preferences.AgeMax > 99 {
		preferences.AgeMax = 99
	}
	if preferences.MaxDistance < 1 || preferences.MaxDistance > 10000 {
		preferences.MaxDistance = 50
	}
	if preferences.MinFame < 0 || preferences.MinFame > 100 {
		preferences.MinFame = 0
	}
	return nil
}