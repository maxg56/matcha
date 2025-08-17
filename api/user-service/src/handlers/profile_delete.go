package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"user-service/src/conf"
	"user-service/src/models"
	"user-service/src/utils"
)

// DeleteProfileHandler soft deletes a user profile
func DeleteProfileHandler(c *gin.Context) {
	userIDParam := c.Param("id")

	id, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	// Get authenticated user ID from JWT middleware
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	// Users can only delete their own profile
	if uint(id) != authenticatedUserID.(uint) {
		utils.RespondError(c, http.StatusForbidden, "cannot delete another user's profile")
		return
	}

	var user models.User
	if err := conf.DB.First(&user, id).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "user not found")
		return
	}

	// Cascade delete: soft delete user and related data
	tx := conf.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Delete related tags
	if err := tx.Where("user_id = ?", user.ID).Delete(&models.UserTag{}).Error; err != nil {
		tx.Rollback()
		utils.RespondError(c, http.StatusInternalServerError, "failed to delete user tags")
		return
	}

	// Delete related images
	if err := tx.Where("user_id = ?", user.ID).Delete(&models.Image{}).Error; err != nil {
		tx.Rollback()
		utils.RespondError(c, http.StatusInternalServerError, "failed to delete user images")
		return
	}

	// Soft delete the user
	if err := tx.Delete(&user).Error; err != nil {
		tx.Rollback()
		utils.RespondError(c, http.StatusInternalServerError, "failed to delete profile")
		return
	}

	if err := tx.Commit().Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to commit deletion")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "Profile deleted successfully",
	})
}
