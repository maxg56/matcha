package handlers

import (
	"media-service/src/utils"

	"github.com/gin-gonic/gin"
)

// HealthCheckHandler handles health check requests
func HealthCheckHandler(c *gin.Context) {
	utils.RespondSuccess(c, map[string]string{
		"status":  "ok",
		"service": "media-service",
	}, "Service is healthy")
}