package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"user-service/src/conf"
	"user-service/src/models"
	"user-service/src/utils"
)

// GetProfileHandler retrieves a user profile by ID
func GetProfileHandler(c *gin.Context) {
	userID := c.Param("id")

	id, err := strconv.ParseUint(userID, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	var user models.User
	if err := conf.DB.Preload("Tags").Preload("Images", func(db *gorm.DB) *gorm.DB {
		return db.Where("is_active = ?", true).Order("created_at ASC")
	}).First(&user, id).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "user not found")
		return
	}

	// Convert to public profile
	profile := user.ToPublicProfile()

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"profile": profile,
	})
}
