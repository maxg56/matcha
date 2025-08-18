package utils

import (
	"github.com/gin-gonic/gin"
)

// RespondSuccess sends a successful JSON response
func RespondSuccess(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, gin.H{
		"success": true,
		"data":    data,
	})
}

// RespondError sends an error JSON response
func RespondError(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, gin.H{
		"success": false,
		"error":   message,
	})
}
