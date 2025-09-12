
package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"user-service/src/conf"
	"user-service/src/models"
	"user-service/src/utils"
)

// GetOwnProfileHandler retrieves the authenticated user's profile in jwt
func GetOwnProfileHandler(c *gin.Context) {
	userID := c.GetInt("userID")
	fmt.Println("Authenticated user ID:", userID)
	if userID == 0 {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	id := uint(userID)
	if id == 0 {
		utils.RespondError(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	var user models.User
	if err := conf.DB.Preload("Tags").Preload("Images", "is_active = ?", true).First(&user, id).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "user not found")
		return
	}

	// Convert to public profile
	profile := user.ToPublicProfile()

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"profile": profile,
	})
}