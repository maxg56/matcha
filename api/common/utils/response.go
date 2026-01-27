package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// StandardResponse is the unified response format across all services
type StandardResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// RespondSuccess sends a successful JSON response
// Parameters are ordered: context, data
func RespondSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, StandardResponse{
		Success: true,
		Data:    data,
	})
}

// RespondSuccessWithStatus sends a successful JSON response with custom status code
// Parameters are ordered: context, status, data
func RespondSuccessWithStatus(c *gin.Context, status int, data interface{}) {
	c.JSON(status, StandardResponse{
		Success: true,
		Data:    data,
	})
}

// RespondError sends an error JSON response
// IMPORTANT: Parameters are ALWAYS ordered: context, status, message
// This fixes the inconsistency found in match-service
func RespondError(c *gin.Context, status int, message string) {
	c.JSON(status, StandardResponse{
		Success: false,
		Error:   message,
	})
}

// RespondErrorWithAbort sends an error response and aborts the request
// Useful for middleware that needs to stop request processing
func RespondErrorWithAbort(c *gin.Context, status int, message string) {
	RespondError(c, status, message)
	c.Abort()
}

// Common error responses for convenience

// RespondBadRequest sends a 400 Bad Request error
func RespondBadRequest(c *gin.Context, message string) {
	RespondError(c, http.StatusBadRequest, message)
}

// RespondUnauthorized sends a 401 Unauthorized error
func RespondUnauthorized(c *gin.Context, message string) {
	RespondError(c, http.StatusUnauthorized, message)
}

// RespondForbidden sends a 403 Forbidden error
func RespondForbidden(c *gin.Context, message string) {
	RespondError(c, http.StatusForbidden, message)
}

// RespondNotFound sends a 404 Not Found error
func RespondNotFound(c *gin.Context, message string) {
	RespondError(c, http.StatusNotFound, message)
}

// RespondConflict sends a 409 Conflict error
func RespondConflict(c *gin.Context, message string) {
	RespondError(c, http.StatusConflict, message)
}

// RespondInternalError sends a 500 Internal Server Error
// Note: In production, avoid exposing internal error details
func RespondInternalError(c *gin.Context, message string) {
	RespondError(c, http.StatusInternalServerError, message)
}

// RespondServiceUnavailable sends a 503 Service Unavailable error
func RespondServiceUnavailable(c *gin.Context, message string) {
	RespondError(c, http.StatusServiceUnavailable, message)
}
