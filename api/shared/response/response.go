package response

import (
	"github.com/gin-gonic/gin"
	"auth-service/api/shared/errors"
)

// StandardResponse represents the unified API response format
type StandardResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorInfo  `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// ErrorInfo provides structured error information
type ErrorInfo struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

// Success sends a successful response with data
func Success(c *gin.Context, status int, data interface{}) {
	c.JSON(status, StandardResponse{
		Success: true,
		Data:    data,
	})
}

// SuccessWithMessage sends a successful response with a message
func SuccessWithMessage(c *gin.Context, status int, data interface{}, message string) {
	c.JSON(status, StandardResponse{
		Success: true,
		Data:    data,
		Message: message,
	})
}

// Error sends an error response using APIError
func Error(c *gin.Context, err errors.APIError) {
	c.JSON(err.HTTPCode, StandardResponse{
		Success: false,
		Error: &ErrorInfo{
			Code:    err.Code,
			Message: err.Message,
			Details: err.Details,
		},
	})
}

// ErrorWithMessage sends a custom error response
func ErrorWithMessage(c *gin.Context, status int, code, message string) {
	c.JSON(status, StandardResponse{
		Success: false,
		Error: &ErrorInfo{
			Code:    code,
			Message: message,
		},
	})
}

// ValidationError sends a validation error with field details
func ValidationError(c *gin.Context, field, reason string) {
	Error(c, errors.ErrInvalidPayload.WithDetails(field+": "+reason))
}

// DatabaseError sends a database error response
func DatabaseError(c *gin.Context, operation string) {
	Error(c, errors.ErrDatabaseError.WithDetails("Failed to "+operation))
}

// NotFound sends a not found error for a specific resource
func NotFound(c *gin.Context, resource string) {
	Error(c, errors.ErrNotFound.WithMessage(resource+" not found"))
}

// Unauthorized sends an unauthorized error
func Unauthorized(c *gin.Context, reason string) {
	err := errors.ErrUnauthorized
	if reason != "" {
		err = err.WithDetails(reason)
	}
	Error(c, err)
}

// Forbidden sends a forbidden error
func Forbidden(c *gin.Context, action string) {
	Error(c, errors.ErrForbidden.WithDetails("Cannot "+action))
}

// ConflictError sends a conflict error for duplicate resources
func ConflictError(c *gin.Context, resource, identifier string) {
	Error(c, errors.ErrConflict.WithMessage(resource+" '"+identifier+"' already exists"))
}