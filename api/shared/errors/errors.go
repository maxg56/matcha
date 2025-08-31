package errors

import (
	"fmt"
	"net/http"
)

// APIError represents a structured API error
type APIError struct {
	Code     string `json:"code"`
	Message  string `json:"message"`
	Details  string `json:"details,omitempty"`
	HTTPCode int    `json:"-"`
}

// Error implements the error interface
func (e APIError) Error() string {
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// Common API errors
var (
	// Authentication errors
	ErrUnauthorized = APIError{
		Code:     "UNAUTHORIZED",
		Message:  "Authentication required",
		HTTPCode: http.StatusUnauthorized,
	}
	
	ErrInvalidToken = APIError{
		Code:     "INVALID_TOKEN", 
		Message:  "Invalid or expired token",
		HTTPCode: http.StatusUnauthorized,
	}
	
	ErrTokenRevoked = APIError{
		Code:     "TOKEN_REVOKED",
		Message:  "Token has been revoked",
		HTTPCode: http.StatusUnauthorized,
	}
	
	// Validation errors
	ErrInvalidPayload = APIError{
		Code:     "INVALID_PAYLOAD",
		Message:  "Invalid request payload",
		HTTPCode: http.StatusBadRequest,
	}
	
	ErrMissingField = APIError{
		Code:     "MISSING_FIELD",
		Message:  "Required field is missing",
		HTTPCode: http.StatusBadRequest,
	}
	
	ErrInvalidID = APIError{
		Code:     "INVALID_ID",
		Message:  "Invalid ID format",
		HTTPCode: http.StatusBadRequest,
	}
	
	// Resource errors
	ErrNotFound = APIError{
		Code:     "NOT_FOUND",
		Message:  "Resource not found",
		HTTPCode: http.StatusNotFound,
	}
	
	ErrConflict = APIError{
		Code:     "CONFLICT",
		Message:  "Resource already exists",
		HTTPCode: http.StatusConflict,
	}
	
	ErrForbidden = APIError{
		Code:     "FORBIDDEN",
		Message:  "Access denied",
		HTTPCode: http.StatusForbidden,
	}
	
	// Server errors
	ErrInternalServer = APIError{
		Code:     "INTERNAL_ERROR",
		Message:  "Internal server error",
		HTTPCode: http.StatusInternalServerError,
	}
	
	ErrDatabaseError = APIError{
		Code:     "DATABASE_ERROR",
		Message:  "Database operation failed",
		HTTPCode: http.StatusInternalServerError,
	}
	
	ErrServiceUnavailable = APIError{
		Code:     "SERVICE_UNAVAILABLE", 
		Message:  "Service temporarily unavailable",
		HTTPCode: http.StatusServiceUnavailable,
	}
)

// NewAPIError creates a custom API error
func NewAPIError(code, message string, httpCode int) APIError {
	return APIError{
		Code:     code,
		Message:  message,
		HTTPCode: httpCode,
	}
}

// WithDetails adds details to an API error
func (e APIError) WithDetails(details string) APIError {
	e.Details = details
	return e
}

// WithMessage customizes the message
func (e APIError) WithMessage(message string) APIError {
	e.Message = message
	return e
}