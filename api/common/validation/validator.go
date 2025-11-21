package validation

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
)

// V is the shared validator instance
var V = validator.New()

func init() {
	// Register custom validators
	V.RegisterValidation("username", validateUsername)
	V.RegisterValidation("password_strength", validatePasswordStrength)
	V.RegisterValidation("age_requirement", validateAgeRequirement)
	V.RegisterValidation("gender", validateGender)
	V.RegisterValidation("sex_pref", validateSexPref)
}

// ValidateStruct validates a struct using the validator
func ValidateStruct(s interface{}) error {
	return V.Struct(s)
}

// FormatValidationErrors converts validator errors to user-friendly messages
func FormatValidationErrors(err error) []string {
	var errors []string
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			errors = append(errors, formatFieldError(e))
		}
	} else {
		errors = append(errors, err.Error())
	}
	return errors
}

// formatFieldError converts a single validation error to a message
func formatFieldError(e validator.FieldError) string {
	field := strings.ToLower(e.Field())
	switch e.Tag() {
	case "required":
		return fmt.Sprintf("%s is required", field)
	case "email":
		return fmt.Sprintf("%s must be a valid email address", field)
	case "min":
		return fmt.Sprintf("%s must be at least %s characters", field, e.Param())
	case "max":
		return fmt.Sprintf("%s must be at most %s characters", field, e.Param())
	case "username":
		return "username must be 3-30 characters, alphanumeric with underscores/hyphens"
	case "password_strength":
		return "password must be at least 8 characters with uppercase, lowercase, number, and special character"
	case "age_requirement":
		return "you must be at least 18 years old"
	case "gender":
		return "gender must be one of: man, woman, non-binary"
	case "sex_pref":
		return "sexual preference must be one of: men, women, both"
	default:
		return fmt.Sprintf("%s is invalid", field)
	}
}

// Custom Validators

// validateUsername checks if username meets requirements
// 3-30 characters, alphanumeric with underscores and hyphens
func validateUsername(fl validator.FieldLevel) bool {
	username := fl.Field().String()
	if len(username) < 3 || len(username) > 30 {
		return false
	}
	matched, _ := regexp.MatchString(`^[a-zA-Z0-9_-]+$`, username)
	return matched
}

// validatePasswordStrength checks password strength
// At least 8 characters, contains uppercase, lowercase, number, and special char
func validatePasswordStrength(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	if len(password) < 8 {
		return false
	}

	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
	hasSpecial := regexp.MustCompile(`[!@#$%^&*(),.?":{}|<>]`).MatchString(password)

	return hasUpper && hasLower && hasNumber && hasSpecial
}

// validateAgeRequirement checks if user is at least 18 years old
func validateAgeRequirement(fl validator.FieldLevel) bool {
	birthDate, ok := fl.Field().Interface().(time.Time)
	if !ok {
		return false
	}

	age := time.Now().Year() - birthDate.Year()
	if time.Now().YearDay() < birthDate.YearDay() {
		age--
	}

	return age >= 18
}

// validateGender checks if gender is valid
func validateGender(fl validator.FieldLevel) bool {
	gender := fl.Field().String()
	validGenders := map[string]bool{
		"man":        true,
		"woman":      true,
		"non-binary": true,
	}
	return validGenders[gender]
}

// validateSexPref checks if sexual preference is valid
func validateSexPref(fl validator.FieldLevel) bool {
	sexPref := fl.Field().String()
	validPrefs := map[string]bool{
		"men":   true,
		"women": true,
		"both":  true,
	}
	return validPrefs[sexPref]
}

// Common validation helpers

// IsValidEmail checks if an email is valid
func IsValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// IsValidUsername checks if a username is valid
func IsValidUsername(username string) bool {
	if len(username) < 3 || len(username) > 30 {
		return false
	}
	matched, _ := regexp.MatchString(`^[a-zA-Z0-9_-]+$`, username)
	return matched
}

// SanitizeInput removes potentially dangerous characters from input
func SanitizeInput(input string) string {
	// Remove null bytes
	input = strings.ReplaceAll(input, "\x00", "")
	// Trim whitespace
	input = strings.TrimSpace(input)
	return input
}
