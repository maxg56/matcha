package utils

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// RespondSuccess sends a successful response
func RespondSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    data,
	})
}

// RespondError sends an error response
func RespondError(c *gin.Context, statusCode int, message string) {
	log.Printf("Error [%d]: %s", statusCode, message)
	c.JSON(statusCode, Response{
		Success: false,
		Error:   message,
	})
}

// RespondCreated sends a successful creation response
func RespondCreated(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, Response{
		Success: true,
		Data:    data,
	})
}