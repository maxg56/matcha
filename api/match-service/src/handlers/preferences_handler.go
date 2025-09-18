package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"match-service/src/services"
	"match-service/src/utils"
)

// GetUserPreferencesHandler returns the learned preferences for a user
func GetUserPreferencesHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	vectorService := services.NewVectorMatchingService()
	preferences, err := vectorService.GetUserPreferences(userID)
	if err != nil {
		utils.RespondError(c, "Failed to get user preferences: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"user_id":     userID,
		"preferences": preferences,
	})
}