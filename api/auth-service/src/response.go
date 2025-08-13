package main

import (
	"github.com/gin-gonic/gin"
)

// respondSuccess returns a standardized success envelope
func respondSuccess(c *gin.Context, statusCode int, data any) {
	c.JSON(statusCode, gin.H{
		"status": "success",
		"data":   data,
	})
}

// respondError returns a standardized error envelope
func respondError(c *gin.Context, code int, message string) {
	c.JSON(code, gin.H{
		"status":  "error",
		"message": message,
		"code":    code,
	})
}
