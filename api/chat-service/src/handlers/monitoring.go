package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// ConnectionStats represents WebSocket connection statistics
type ConnectionStats struct {
	ActiveConnections int            `json:"active_connections"`
	ConnectedUsers    []uint         `json:"connected_users"`
	TotalMessages     int64          `json:"total_messages_sent"`
	Uptime           time.Duration   `json:"uptime_seconds"`
	LastActivity     time.Time       `json:"last_activity"`
}

var (
	serviceStartTime = time.Now()
	totalMessagesSent int64
	lastActivity     = time.Now()
)

// GetConnectionStats returns WebSocket connection statistics
func GetConnectionStats(c *gin.Context) {
	if globalHub == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "WebSocket hub not initialized",
		})
		return
	}

	stats := ConnectionStats{
		ActiveConnections: len(globalHub.GetConnectedUsers()),
		ConnectedUsers:    globalHub.GetConnectedUsers(),
		TotalMessages:     totalMessagesSent,
		Uptime:           time.Since(serviceStartTime),
		LastActivity:     lastActivity,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}

// GetDetailedStats returns more detailed monitoring information
func GetDetailedStats(c *gin.Context) {
	if globalHub == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "WebSocket hub not initialized",
		})
		return
	}

	connectedUsers := globalHub.GetConnectedUsers()
	
	detailedStats := gin.H{
		"websocket": gin.H{
			"active_connections": len(connectedUsers),
			"connected_users":    connectedUsers,
			"hub_status":        "running",
		},
		"service": gin.H{
			"uptime_seconds":     time.Since(serviceStartTime).Seconds(),
			"total_messages":     totalMessagesSent,
			"last_activity":      lastActivity,
			"service_start_time": serviceStartTime,
		},
		"health": gin.H{
			"status":    "healthy",
			"timestamp": time.Now(),
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    detailedStats,
	})
}

// IncrementMessageCount increments the total message counter
func IncrementMessageCount() {
	totalMessagesSent++
	lastActivity = time.Now()
}

// UpdateLastActivity updates the last activity timestamp
func UpdateLastActivity() {
	lastActivity = time.Now()
}