package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"match-service/src/services"
	"match-service/src/utils"
)

// ResetSeenProfilesHandler allows a user to reset their seen profiles (for development/testing)
func ResetSeenProfilesHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	userService := services.NewUserService()
	err := userService.ResetSeenProfiles(userID)
	if err != nil {
		utils.RespondError(c, "Failed to reset seen profiles: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "Seen profiles reset successfully",
		"user_id": userID,
	})
}