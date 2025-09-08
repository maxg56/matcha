package utils

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// StandardResponse represents the API response format
type StandardResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}


func RespondCreated(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, StandardResponse{
		Success: true,
		Data:    data,
	})
}

// RespondSuccess sends a successful response
func RespondSuccess(c *gin.Context, status int, data interface{}) {
	c.JSON(status, StandardResponse{
		Success: true,
		Data:    data,
	})
}

// RespondError sends an error response
func RespondError(c *gin.Context, status int, message string) {
	c.JSON(status, StandardResponse{
		Success: false,
		Error:   message,
	})
}
