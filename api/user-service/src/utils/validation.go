package utils

import (
	"fmt"
	"regexp"
	"strings"
	"time"
)

// ValidateEmail validates email format
func ValidateEmail(email string) error {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return fmt.Errorf("invalid email format")
	}
	return nil
}

// ValidateAge validates age based on birth date
func ValidateAge(birthDate time.Time) (int, error) {
	now := time.Now()
	age := now.Year() - birthDate.Year()
	
	// Adjust if birthday hasn't occurred this year
	if now.YearDay() < birthDate.YearDay() {
		age--
	}
	
	if age < 18 {
		return 0, fmt.Errorf("user must be at least 18 years old")
	}
	
	if age > 120 {
		return 0, fmt.Errorf("invalid birth date")
	}
	
	return age, nil
}

// ValidateGender validates gender value
func ValidateGender(gender string) error {
	validGenders := []string{"male", "female", "other"}
	gender = strings.ToLower(strings.TrimSpace(gender))
	
	for _, validGender := range validGenders {
		if gender == validGender {
			return nil
		}
	}
	
	return fmt.Errorf("gender must be one of: %s", strings.Join(validGenders, ", "))
}

// ValidateSexPreference validates sexual preference
func ValidateSexPreference(sexPref string) error {
	validPreferences := []string{"male", "female", "both", "other"}
	sexPref = strings.ToLower(strings.TrimSpace(sexPref))
	
	for _, validPref := range validPreferences {
		if sexPref == validPref {
			return nil
		}
	}
	
	return fmt.Errorf("sexual preference must be one of: %s", strings.Join(validPreferences, ", "))
}

// ValidateHeight validates height in centimeters
func ValidateHeight(height int) error {
	if height < 100 || height > 250 {
		return fmt.Errorf("height must be between 100 and 250 cm")
	}
	return nil
}

// ValidateBio validates biography length and content
func ValidateBio(bio string) error {
	bio = strings.TrimSpace(bio)
	if len(bio) > 400 {
		return fmt.Errorf("bio must not exceed 400 characters")
	}
	return nil
}

// ValidateTagName validates individual tag name
func ValidateTagName(tagName string) error {
	tagName = strings.TrimSpace(tagName)
	
	if len(tagName) == 0 {
		return fmt.Errorf("tag name cannot be empty")
	}
	
	if len(tagName) > 30 {
		return fmt.Errorf("tag name must not exceed 30 characters")
	}
	
	// Allow only alphanumeric characters, spaces, and hyphens
	tagRegex := regexp.MustCompile(`^[a-zA-Z0-9\s\-]+$`)
	if !tagRegex.MatchString(tagName) {
		return fmt.Errorf("tag name can only contain letters, numbers, spaces, and hyphens")
	}
	
	return nil
}

// ValidateTags validates array of tags
func ValidateTags(tags []string) error {
	if len(tags) > 10 {
		return fmt.Errorf("maximum 10 tags allowed")
	}
	
	tagMap := make(map[string]bool)
	for _, tag := range tags {
		tag = strings.ToLower(strings.TrimSpace(tag))
		
		if err := ValidateTagName(tag); err != nil {
			return err
		}
		
		// Check for duplicates
		if tagMap[tag] {
			return fmt.Errorf("duplicate tag: %s", tag)
		}
		tagMap[tag] = true
	}
	
	return nil
}

// ValidateCoordinates validates latitude and longitude
func ValidateCoordinates(lat, lng float64) error {
	if lat < -90 || lat > 90 {
		return fmt.Errorf("latitude must be between -90 and 90")
	}
	
	if lng < -180 || lng > 180 {
		return fmt.Errorf("longitude must be between -180 and 180")
	}
	
	return nil
}

// ValidateReportType validates report type
func ValidateReportType(reportType string) error {
	validTypes := []string{"fake_account", "inappropriate_content", "harassment", "spam", "other"}
	reportType = strings.ToLower(strings.TrimSpace(reportType))
	
	for _, validType := range validTypes {
		if reportType == validType {
			return nil
		}
	}
	
	return fmt.Errorf("report type must be one of: %s", strings.Join(validTypes, ", "))
}

// ValidatePreferredGenders validates preferred genders array
func ValidatePreferredGenders(genders []string) error {
	if len(genders) == 0 {
		return fmt.Errorf("at least one preferred gender must be specified")
	}
	
	validGenders := []string{"male", "female", "other"}
	genderMap := make(map[string]bool)
	
	for _, gender := range genders {
		gender = strings.ToLower(strings.TrimSpace(gender))
		
		// Check if valid gender
		isValid := false
		for _, validGender := range validGenders {
			if gender == validGender {
				isValid = true
				break
			}
		}
		
		if !isValid {
			return fmt.Errorf("invalid preferred gender: %s", gender)
		}
		
		// Check for duplicates
		if genderMap[gender] {
			return fmt.Errorf("duplicate preferred gender: %s", gender)
		}
		genderMap[gender] = true
	}
	
	return nil
}

// ValidateDistance validates distance value
func ValidateDistance(distance float64) error {
	if distance <= 0 {
		return fmt.Errorf("distance must be greater than 0")
	}
	
	if distance > 10000 {
		return fmt.Errorf("maximum distance is 10,000 km")
	}
	
	return nil
}

// ValidateFame validates fame score
func ValidateFame(fame int) error {
	if fame < 0 {
		return fmt.Errorf("fame score cannot be negative")
	}
	
	if fame > 1000 {
		return fmt.Errorf("fame score cannot exceed 1000")
	}
	
	return nil
}

// ValidateString validates general string fields
func ValidateString(value, fieldName string, minLen, maxLen int) error {
	value = strings.TrimSpace(value)
	
	if len(value) < minLen {
		return fmt.Errorf("%s must be at least %d characters long", fieldName, minLen)
	}
	
	if len(value) > maxLen {
		return fmt.Errorf("%s must not exceed %d characters", fieldName, maxLen)
	}
	
	return nil
}