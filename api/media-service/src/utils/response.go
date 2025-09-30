package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response represents the standard API response format
type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// RespondSuccess sends a successful response
func RespondSuccess(c *gin.Context, data interface{}, message string) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    data,
	})
}

// RespondError sends an error response
func RespondError(c *gin.Context, message string, statusCode int) {
	c.JSON(statusCode, Response{
		Success: false,
		Error:   message,
	})
}