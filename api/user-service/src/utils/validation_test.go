package utils

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		email    string
		expected bool
	}{
		{"test@example.com", true},
		{"user.name+tag@example.co.uk", true},
		{"invalid.email", false},
		{"@example.com", false},
		{"test@", false},
		{"", false},
	}

	for _, test := range tests {
		err := ValidateEmail(test.email)
		if test.expected {
			assert.NoError(t, err, "Email %s should be valid", test.email)
		} else {
			assert.Error(t, err, "Email %s should be invalid", test.email)
		}
	}
}

func TestValidateAge(t *testing.T) {
	now := time.Now()
	
	// Valid age (25 years old) - use a specific date to avoid timing issues
	birthDate := time.Date(now.Year()-25, now.Month(), now.Day()-1, 0, 0, 0, 0, time.UTC)
	age, err := ValidateAge(birthDate)
	assert.NoError(t, err)
	assert.Equal(t, 25, age)
	
	// Too young (17 years old)
	youngBirthDate := now.AddDate(-17, 0, 0)
	_, err = ValidateAge(youngBirthDate)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "at least 18 years old")
	
	// Too old (150 years old)
	oldBirthDate := now.AddDate(-150, 0, 0)
	_, err = ValidateAge(oldBirthDate)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid birth date")
}

func TestValidateGender(t *testing.T) {
	validGenders := []string{"male", "female", "other", "Male", "FEMALE", "Other"}
	for _, gender := range validGenders {
		err := ValidateGender(gender)
		assert.NoError(t, err, "Gender %s should be valid", gender)
	}
	
	invalidGenders := []string{"invalid", "xyz", ""}
	for _, gender := range invalidGenders {
		err := ValidateGender(gender)
		assert.Error(t, err, "Gender %s should be invalid", gender)
	}
}

func TestValidateTags(t *testing.T) {
	// Valid tags
	validTags := []string{"music", "travel", "sports"}
	err := ValidateTags(validTags)
	assert.NoError(t, err)
	
	// Too many tags
	tooManyTags := make([]string, 11)
	for i := 0; i < 11; i++ {
		tooManyTags[i] = "tag" + string(rune(i))
	}
	err = ValidateTags(tooManyTags)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "maximum 10 tags")
	
	// Duplicate tags
	duplicateTags := []string{"music", "travel", "music"}
	err = ValidateTags(duplicateTags)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "duplicate tag")
	
	// Invalid tag name
	invalidTags := []string{"valid-tag", "invalid@tag"}
	err = ValidateTags(invalidTags)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "can only contain letters")
}

func TestValidateCoordinates(t *testing.T) {
	// Valid coordinates
	err := ValidateCoordinates(45.5, -73.6) // Montreal
	assert.NoError(t, err)
	
	// Invalid latitude (too high)
	err = ValidateCoordinates(91.0, -73.6)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "latitude must be between")
	
	// Invalid longitude (too low)
	err = ValidateCoordinates(45.5, -181.0)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "longitude must be between")
}

func TestValidateHeight(t *testing.T) {
	// Valid height
	err := ValidateHeight(175)
	assert.NoError(t, err)
	
	// Too short
	err = ValidateHeight(99)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "height must be between")
	
	// Too tall
	err = ValidateHeight(251)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "height must be between")
}

func TestValidatePreferredGenders(t *testing.T) {
	// Valid preferences
	validPrefs := []string{"male", "female"}
	err := ValidatePreferredGenders(validPrefs)
	assert.NoError(t, err)
	
	// Empty preferences
	err = ValidatePreferredGenders([]string{})
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "at least one preferred gender")
	
	// Invalid gender
	invalidPrefs := []string{"male", "invalid"}
	err = ValidatePreferredGenders(invalidPrefs)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid preferred gender")
	
	// Duplicate genders
	duplicatePrefs := []string{"male", "female", "male"}
	err = ValidatePreferredGenders(duplicatePrefs)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "duplicate preferred gender")
}