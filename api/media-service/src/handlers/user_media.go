package handlers

import (
	"log"
	"strconv"

	"media-service/src/conf"
	"media-service/src/models"
	"media-service/src/utils"

	"github.com/gin-gonic/gin"
)

// ListUserMediaHandler returns all media for the authenticated user
func ListUserMediaHandler(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, "Authentication required", 401)
		return
	}

	var images []models.Image
	if err := conf.DB.Where("user_id = ? AND is_active = ?", userID, true).
		Order("created_at DESC").Find(&images).Error; err != nil {
		log.Printf("Failed to fetch user media: %v", err)
		utils.RespondError(c, "Failed to fetch media", 500)
		return
	}

	// Convert to response format
	var response []map[string]interface{}
	for _, img := range images {
		response = append(response, img.ToMap())
	}

	utils.RespondSuccess(c, response, "User media retrieved successfully")
}

// GetUserMediaHandler returns all media for a specific user (public endpoint)
func GetUserMediaHandler(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		utils.RespondError(c, "Invalid user ID", 400)
		return
	}

	var images []models.Image
	if err := conf.DB.Where("user_id = ? AND is_active = ?", uint(userID), true).
		Order("is_profile DESC, created_at DESC").Find(&images).Error; err != nil {
		log.Printf("Failed to fetch user media: %v", err)
		utils.RespondError(c, "Failed to fetch media", 500)
		return
	}

	// Convert to response format (only public fields)
	var response []map[string]interface{}
	for _, img := range images {
		data := img.ToMap()
		// Remove sensitive fields for public access
		delete(data, "file_path")
		response = append(response, data)
	}

	utils.RespondSuccess(c, response, "User media retrieved successfully")
}

// SetProfileImageHandler sets an image as the user's profile picture
func SetProfileImageHandler(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, "Authentication required", 401)
		return
	}

	var request struct {
		ImageID uint `json:"image_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		utils.RespondError(c, "Invalid request data", 400)
		return
	}

	// Start transaction
	tx := conf.DB.Begin()

	// First, unset all profile images for this user
	if err := tx.Model(&models.Image{}).
		Where("user_id = ?", userID).
		Update("is_profile", false).Error; err != nil {
		tx.Rollback()
		log.Printf("Failed to unset profile images: %v", err)
		utils.RespondError(c, "Failed to update profile image", 500)
		return
	}

	// Then set the selected image as profile
	var image models.Image
	if err := tx.Where("id = ? AND user_id = ? AND is_active = ?",
		request.ImageID, userID, true).First(&image).Error; err != nil {
		tx.Rollback()
		utils.RespondError(c, "Image not found", 404)
		return
	}

	image.IsProfile = true
	if err := tx.Save(&image).Error; err != nil {
		tx.Rollback()
		log.Printf("Failed to set profile image: %v", err)
		utils.RespondError(c, "Failed to update profile image", 500)
		return
	}

	// Commit transaction
	tx.Commit()

	utils.RespondSuccess(c, image.ToMap(), "Profile image updated successfully")
}