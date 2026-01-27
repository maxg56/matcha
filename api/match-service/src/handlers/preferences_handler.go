package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"match-service/src/services"
	"match-service/src/utils"
)

// GetUserPreferencesHandler returns the user's explicit matching preferences
func GetUserPreferencesHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	preferencesManager := services.NewUserPreferencesManager()
	preferences, err := preferencesManager.GetUserMatchingPreferences(userID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to get user preferences: "+err.Error())
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"user_id":     userID,
		"preferences": preferences,
	})
}