package utils

import (
	"encoding/json"
	"user-service/src/models"
)

// MapSexPrefToPreferredGenders converts user's sex_pref to preferred_genders JSON array
func MapSexPrefToPreferredGenders(sexPref string) string {
	var genders []string

	switch sexPref {
	case "man":
		genders = []string{"man"}
	case "woman":
		genders = []string{"woman"}
	case "both":
		genders = []string{"man", "woman"}
	case "other":
		genders = []string{"man", "woman", "other"}
	default:
		// Fallback to both if unknown
		genders = []string{"man", "woman"}
	}

	jsonBytes, _ := json.Marshal(genders)
	return string(jsonBytes)
}

// CreateDefaultUserPreferences creates default preferences for a user
func CreateDefaultUserPreferences(userID int, sexPref string) models.UserPreference {
	// Default lifestyle preferences to "any" (no filtering)
	anyPref := "any"

	return models.UserPreference{
		UserID:           userID,
		AgeMin:           18,
		AgeMax:           99,
		MaxDistance:      100, // 100km as requested
		MinFame:          0,
		PreferredGenders: MapSexPrefToPreferredGenders(sexPref),
		RequiredTags:     "[]", // Empty array
		BlockedTags:      "[]", // Empty array

		// Lifestyle preferences - default to "any" (no filtering)
		SmokingPreference:  &anyPref,
		AlcoholPreference:  &anyPref,
		DrugsPreference:    &anyPref,
		CannabisPreference: &anyPref,

		// Religious preferences - default to "any" (no filtering)
		ReligionPreference: &anyPref,
		BlockedReligions:   "[]", // Empty array
	}
}

// GetSmartAgeRange calculates a smart age range based on user's age
func GetSmartAgeRange(userAge int) (int, int) {
	ageMin := userAge - 5
	ageMax := userAge + 10

	// Ensure minimum age is at least 18
	if ageMin < 18 {
		ageMin = 18
	}

	// Ensure maximum age is reasonable
	if ageMax > 99 {
		ageMax = 99
	}

	// Ensure range is at least 5 years
	if ageMax-ageMin < 5 {
		ageMax = ageMin + 5
		if ageMax > 99 {
			ageMax = 99
			ageMin = ageMax - 5
		}
	}

	return ageMin, ageMax
}

// CreateSmartDefaultPreferences creates smart default preferences based on user data
func CreateSmartDefaultPreferences(userID int, userAge int, sexPref string) models.UserPreference {
	ageMin, ageMax := GetSmartAgeRange(userAge)
	// Default lifestyle preferences to "any" (no filtering)
	anyPref := "any"

	return models.UserPreference{
		UserID:           userID,
		AgeMin:           ageMin,
		AgeMax:           ageMax,
		MaxDistance:      100, // 100km as requested
		MinFame:          0,
		PreferredGenders: MapSexPrefToPreferredGenders(sexPref),
		RequiredTags:     "[]", // Empty array
		BlockedTags:      "[]", // Empty array

		// Lifestyle preferences - default to "any" (no filtering)
		SmokingPreference:  &anyPref,
		AlcoholPreference:  &anyPref,
		DrugsPreference:    &anyPref,
		CannabisPreference: &anyPref,

		// Religious preferences - default to "any" (no filtering)
		ReligionPreference: &anyPref,
		BlockedReligions:   "[]", // Empty array
	}
}