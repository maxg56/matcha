package validation

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

type TestRegistration struct {
	Username  string    `validate:"required,username"`
	Email     string    `validate:"required,email"`
	Password  string    `validate:"required,password_strength"`
	FirstName string    `validate:"required,min=2,max=50"`
	LastName  string    `validate:"required,min=2,max=50"`
	BirthDate time.Time `validate:"required,age_requirement"`
	Gender    string    `validate:"required,gender"`
	SexPref   string    `validate:"required,sex_pref"`
}

func TestValidateStruct_Success(t *testing.T) {
	validReg := TestRegistration{
		Username:  "john_doe",
		Email:     "john@example.com",
		Password:  "SecurePass123!",
		FirstName: "John",
		LastName:  "Doe",
		BirthDate: time.Date(1990, 1, 1, 0, 0, 0, 0, time.UTC),
		Gender:    "man",
		SexPref:   "women",
	}

	err := ValidateStruct(validReg)
	assert.NoError(t, err)
}

func TestValidateStruct_MissingRequired(t *testing.T) {
	invalidReg := TestRegistration{
		Email: "john@example.com",
		// Missing Username
	}

	err := ValidateStruct(invalidReg)
	assert.Error(t, err)

	errors := FormatValidationErrors(err)
	assert.NotEmpty(t, errors)
	assert.Contains(t, errors[0], "username")
}

func TestValidateUsername(t *testing.T) {
	tests := []struct {
		name     string
		username string
		valid    bool
	}{
		{"Valid username", "john_doe", true},
		{"Valid with numbers", "user123", true},
		{"Valid with hyphen", "john-doe", true},
		{"Too short", "ab", false},
		{"Too long", "this_username_is_definitely_way_too_long_for_validation", false},
		{"Invalid characters", "john@doe", false},
		{"Spaces not allowed", "john doe", false},
		{"Valid underscore", "user_name_123", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsValidUsername(tt.username)
			assert.Equal(t, tt.valid, result)
		})
	}
}

func TestValidatePasswordStrength(t *testing.T) {
	tests := []struct {
		name     string
		password string
		valid    bool
	}{
		{"Valid strong password", "SecurePass123!", true},
		{"Valid with special chars", "MyP@ssw0rd!", true},
		{"Too short", "Pass1!", false},
		{"No uppercase", "password123!", false},
		{"No lowercase", "PASSWORD123!", false},
		{"No number", "PasswordPass!", false},
		{"No special char", "Password123", false},
		{"Only letters", "PasswordOnly", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			reg := TestRegistration{
				Username:  "testuser",
				Email:     "test@example.com",
				Password:  tt.password,
				FirstName: "Test",
				LastName:  "User",
				BirthDate: time.Date(1990, 1, 1, 0, 0, 0, 0, time.UTC),
				Gender:    "man",
				SexPref:   "women",
			}

			err := ValidateStruct(reg)
			if tt.valid {
				assert.NoError(t, err)
			} else {
				assert.Error(t, err)
				errors := FormatValidationErrors(err)
				assert.True(t, len(errors) > 0)
			}
		})
	}
}

func TestValidateAgeRequirement(t *testing.T) {
	tests := []struct {
		name      string
		birthDate time.Time
		valid     bool
	}{
		{"18 years old", time.Now().AddDate(-18, 0, -1), true},
		{"25 years old", time.Now().AddDate(-25, 0, 0), true},
		{"17 years old", time.Now().AddDate(-17, 0, 0), false},
		{"Under 18", time.Now().AddDate(-18, 0, 1), false},
		{"Just turned 18", time.Now().AddDate(-18, 0, 0), true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			reg := TestRegistration{
				Username:  "testuser",
				Email:     "test@example.com",
				Password:  "SecurePass123!",
				FirstName: "Test",
				LastName:  "User",
				BirthDate: tt.birthDate,
				Gender:    "man",
				SexPref:   "women",
			}

			err := ValidateStruct(reg)
			if tt.valid {
				assert.NoError(t, err)
			} else {
				assert.Error(t, err)
				errors := FormatValidationErrors(err)
				assert.Contains(t, errors[0], "18 years old")
			}
		})
	}
}

func TestValidateGender(t *testing.T) {
	tests := []struct {
		name   string
		gender string
		valid  bool
	}{
		{"Valid man", "man", true},
		{"Valid woman", "woman", true},
		{"Valid non-binary", "non-binary", true},
		{"Invalid other", "other", false},
		{"Invalid male", "male", false},
		{"Invalid empty", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			reg := TestRegistration{
				Username:  "testuser",
				Email:     "test@example.com",
				Password:  "SecurePass123!",
				FirstName: "Test",
				LastName:  "User",
				BirthDate: time.Date(1990, 1, 1, 0, 0, 0, 0, time.UTC),
				Gender:    tt.gender,
				SexPref:   "both",
			}

			err := ValidateStruct(reg)
			if tt.valid {
				assert.NoError(t, err)
			} else {
				assert.Error(t, err)
			}
		})
	}
}

func TestValidateSexPref(t *testing.T) {
	tests := []struct {
		name    string
		sexPref string
		valid   bool
	}{
		{"Valid men", "men", true},
		{"Valid women", "women", true},
		{"Valid both", "both", true},
		{"Invalid all", "all", false},
		{"Invalid empty", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			reg := TestRegistration{
				Username:  "testuser",
				Email:     "test@example.com",
				Password:  "SecurePass123!",
				FirstName: "Test",
				LastName:  "User",
				BirthDate: time.Date(1990, 1, 1, 0, 0, 0, 0, time.UTC),
				Gender:    "man",
				SexPref:   tt.sexPref,
			}

			err := ValidateStruct(reg)
			if tt.valid {
				assert.NoError(t, err)
			} else {
				assert.Error(t, err)
			}
		})
	}
}

func TestIsValidEmail(t *testing.T) {
	tests := []struct {
		name  string
		email string
		valid bool
	}{
		{"Valid email", "user@example.com", true},
		{"Valid with subdomain", "user@mail.example.com", true},
		{"Valid with plus", "user+tag@example.com", true},
		{"Invalid no @", "userexample.com", false},
		{"Invalid no domain", "user@", false},
		{"Invalid no TLD", "user@example", false},
		{"Invalid spaces", "user @example.com", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsValidEmail(tt.email)
			assert.Equal(t, tt.valid, result)
		})
	}
}

func TestSanitizeInput(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"Normal input", "hello", "hello"},
		{"With spaces", "  hello  ", "hello"},
		{"With null byte", "hello\x00world", "helloworld"},
		{"Multiple spaces", "  hello   world  ", "hello   world"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SanitizeInput(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestFormatValidationErrors(t *testing.T) {
	invalidReg := TestRegistration{
		Username: "ab", // Too short
		Email:    "invalid-email",
		Password: "weak",
	}

	err := ValidateStruct(invalidReg)
	assert.Error(t, err)

	errors := FormatValidationErrors(err)
	assert.NotEmpty(t, errors)
	// Should have multiple error messages
	assert.True(t, len(errors) > 0)
}
