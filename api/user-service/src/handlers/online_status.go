package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"user-service/src/services"
	"user-service/src/utils"
)

// GetUserOnlineStatusHandler retrieves user online status from Gateway WebSocket connections
func GetUserOnlineStatusHandler(c *gin.Context) {
	userIDStr := c.Param("id")

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	// First try to get real-time status from Gateway WebSocket connections
	gatewayPresenceService := services.NewGatewayPresenceService()
	presence, err := gatewayPresenceService.GetUserWebSocketStatus(uint(userID))

	if err != nil {
		// Fallback to Redis if Gateway is unavailable
		presenceService := services.NewPresenceService()
		redisPresence, redisErr := presenceService.GetUserPresence(uint(userID))
		if redisErr != nil {
			utils.RespondError(c, http.StatusInternalServerError, "failed to get user status from both Gateway and Redis: "+err.Error())
			return
		}
		presence = redisPresence
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"id":       presence.UserID,
		"is_online": presence.IsOnline,
		"last_seen": presence.LastSeen,
		"last_activity": presence.LastActivity,
	})
}