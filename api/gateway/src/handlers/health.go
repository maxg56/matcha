package handlers

import (
	"net/http"
	"time"

	"gateway/src/services"
	"gateway/src/websocket"
	"github.com/gin-gonic/gin"
)

// HealthCheckResponse represents the health check response format
type HealthCheckResponse struct {
	Status              string            `json:"status"`
	Timestamp           time.Time         `json:"timestamp"`
	Services            map[string]string `json:"services"`
	NotificationClient  string            `json:"notification_client"`
}

// HealthCheck returns the gateway health status and service configuration
func HealthCheck(c *gin.Context) {
	notificationStatus := "disconnected"
	if websocket.IsNotificationClientConnected() {
		notificationStatus = "connected"
	}
	
	c.JSON(http.StatusOK, HealthCheckResponse{
		Status:             "ok",
		Timestamp:          time.Now().UTC(),
		Services:           services.GetServicesStatus(),
		NotificationClient: notificationStatus,
	})
}
