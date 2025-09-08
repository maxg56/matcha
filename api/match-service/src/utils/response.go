package utils

import (
	"github.com/gin-gonic/gin"
)

type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

func RespondSuccess(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, SuccessResponse{
		Success: true,
		Data:    data,
	})
}

func RespondError(c *gin.Context, message string, statusCode int) {
	c.JSON(statusCode, ErrorResponse{
		Success: false,
		Error:   message,
	})
}