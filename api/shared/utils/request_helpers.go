package utils

import (
	"strconv"
	"strings"
	
	"github.com/gin-gonic/gin"
	"auth-service/api/shared/response"
	"auth-service/api/shared/errors"
)

// GetUserIDFromContext extracts user ID from request context
func GetUserIDFromContext(c *gin.Context) (uint, error) {
	userIDStr := c.GetHeader("X-User-ID")
	if userIDStr == "" {
		return 0, errors.ErrUnauthorized.WithDetails("User ID not found in request")
	}
	
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		return 0, errors.ErrInvalidID.WithDetails("Invalid user ID format")
	}
	
	return uint(userID), nil
}

// ValidateUserID validates and returns user ID from URL parameter
func ValidateUserID(c *gin.Context, paramName string) (uint, bool) {
	idStr := c.Param(paramName)
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.Error(c, errors.ErrInvalidID.WithDetails("Invalid "+paramName))
		return 0, false
	}
	return uint(id), true
}

// ValidateJSONPayload binds JSON and sends appropriate error if invalid
func ValidateJSONPayload(c *gin.Context, obj interface{}) bool {
	if err := c.ShouldBindJSON(obj); err != nil {
		response.Error(c, errors.ErrInvalidPayload.WithDetails(err.Error()))
		return false
	}
	return true
}

// CheckUserPermission verifies if user can access the requested resource
func CheckUserPermission(c *gin.Context, resourceUserID uint) bool {
	currentUserID, err := GetUserIDFromContext(c)
	if err != nil {
		response.Error(c, err.(errors.APIError))
		return false
	}
	
	if currentUserID != resourceUserID {
		response.Forbidden(c, "access this resource")
		return false
	}
	
	return true
}

// SanitizeString removes dangerous characters from string input
func SanitizeString(input string) string {
	// Remove null bytes and control characters
	cleaned := strings.ReplaceAll(input, "\x00", "")
	cleaned = strings.TrimSpace(cleaned)
	return cleaned
}

// ValidateStringLength checks if string is within acceptable bounds
func ValidateStringLength(value string, minLen, maxLen int, fieldName string) error {
	length := len(strings.TrimSpace(value))
	if length < minLen {
		return errors.ErrInvalidPayload.WithDetails(fieldName + " must be at least " + strconv.Itoa(minLen) + " characters")
	}
	if length > maxLen {
		return errors.ErrInvalidPayload.WithDetails(fieldName + " cannot exceed " + strconv.Itoa(maxLen) + " characters")
	}
	return nil
}

// HandleDatabaseError converts database errors to appropriate API errors
func HandleDatabaseError(err error, operation string) errors.APIError {
	errStr := err.Error()
	
	// Check for common database errors
	if strings.Contains(errStr, "duplicate key") || strings.Contains(errStr, "UNIQUE constraint") {
		return errors.ErrConflict.WithDetails("Resource already exists")
	}
	
	if strings.Contains(errStr, "not found") || strings.Contains(errStr, "no rows") {
		return errors.ErrNotFound.WithDetails("Resource not found")
	}
	
	if strings.Contains(errStr, "foreign key constraint") {
		return errors.ErrInvalidPayload.WithDetails("Invalid reference to related resource")
	}
	
	// Generic database error
	return errors.ErrDatabaseError.WithDetails("Failed to " + operation)
}