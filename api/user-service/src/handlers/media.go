package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"user-service/src/conf"
	"user-service/src/models"
	"user-service/src/utils"
)

// GetUserImagesHandler gets all images for a user
func GetUserImagesHandler(c *gin.Context) {
	userIDParam := c.Param("id")

	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	// Check if user exists
	var user models.User
	if err := conf.DB.First(&user, userID).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "user not found")
		return
	}

	// Get all active images for the user
	var images []models.Image
	if err := conf.DB.Where("user_id = ? AND is_active = ?", userID, true).
		Order("is_profile DESC, created_at ASC").
		Find(&images).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to get user images")
		return
	}

	// Format response
	var imageData []gin.H
	for _, image := range images {
		imageData = append(imageData, gin.H{
			"id":            image.ID,
			"filename":      image.Filename,
			"url":           image.URL(),
			"is_profile":    image.IsProfile,
			"description":   image.Description,
			"alt_text":      image.AltText,
			"width":         image.Width,
			"height":        image.Height,
			"created_at":    image.CreatedAt,
		})
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"images": imageData,
		"total":  len(imageData),
	})
}

// UpdateImageOrderRequest represents image order update payload
type UpdateImageOrderRequest struct {
	ImageOrders []ImageOrder `json:"image_orders" binding:"required"`
}

type ImageOrder struct {
	ImageID   uint `json:"image_id" binding:"required"`
	IsProfile bool `json:"is_profile"`
}

// UpdateImageOrderHandler updates the order and profile image setting
func UpdateImageOrderHandler(c *gin.Context) {
	userIDParam := c.Param("id")

	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	// Get authenticated user ID
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	// Users can only update their own image order
	if uint(userID) != authenticatedUserID.(uint) {
		utils.RespondError(c, http.StatusForbidden, "cannot update another user's images")
		return
	}

	var req UpdateImageOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid image order data: "+err.Error())
		return
	}

	// Start transaction
	tx := conf.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Validate that all images belong to the user
	var imageIDs []uint
	var profileImageCount int
	for _, order := range req.ImageOrders {
		imageIDs = append(imageIDs, order.ImageID)
		if order.IsProfile {
			profileImageCount++
		}
	}

	// Ensure only one profile image
	if profileImageCount > 1 {
		tx.Rollback()
		utils.RespondError(c, http.StatusBadRequest, "only one image can be set as profile image")
		return
	}

	// Verify all images belong to the user
	var count int64
	if err := tx.Model(&models.Image{}).
		Where("id IN ? AND user_id = ?", imageIDs, userID).
		Count(&count).Error; err != nil {
		tx.Rollback()
		utils.RespondError(c, http.StatusInternalServerError, "failed to validate images")
		return
	}

	if count != int64(len(imageIDs)) {
		tx.Rollback()
		utils.RespondError(c, http.StatusBadRequest, "some images do not belong to this user")
		return
	}

	// First, reset all is_profile flags for this user
	if err := tx.Model(&models.Image{}).
		Where("user_id = ?", userID).
		Update("is_profile", false).Error; err != nil {
		tx.Rollback()
		utils.RespondError(c, http.StatusInternalServerError, "failed to reset profile flags")
		return
	}

	// Update each image based on the provided order
	for _, order := range req.ImageOrders {
		if err := tx.Model(&models.Image{}).
			Where("id = ? AND user_id = ?", order.ImageID, userID).
			Update("is_profile", order.IsProfile).Error; err != nil {
			tx.Rollback()
			utils.RespondError(c, http.StatusInternalServerError, "failed to update image")
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to commit changes")
		return
	}

	// Get updated images
	var images []models.Image
	conf.DB.Where("user_id = ? AND is_active = ?", userID, true).
		Order("is_profile DESC, created_at ASC").
		Find(&images)

	// Format response
	var imageData []gin.H
	for _, image := range images {
		imageData = append(imageData, gin.H{
			"id":          image.ID,
			"filename":    image.Filename,
			"url":         image.URL(),
			"is_profile":  image.IsProfile,
			"description": image.Description,
			"created_at":  image.CreatedAt,
		})
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "Image order updated successfully",
		"images":  imageData,
	})
}

// DeleteImageHandler soft deletes a user image
func DeleteImageHandler(c *gin.Context) {
	userIDParam := c.Param("id")
	imageIDParam := c.Param("image_id")

	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	imageID, err := strconv.ParseUint(imageIDParam, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid image ID")
		return
	}

	// Get authenticated user ID
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	// Users can only delete their own images
	if uint(userID) != authenticatedUserID.(uint) {
		utils.RespondError(c, http.StatusForbidden, "cannot delete another user's image")
		return
	}

	// Find the image
	var image models.Image
	if err := conf.DB.Where("id = ? AND user_id = ?", imageID, userID).First(&image).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "image not found")
		return
	}

	// Soft delete by setting is_active to false
	if err := conf.DB.Model(&image).Update("is_active", false).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to delete image")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message":  "Image deleted successfully",
		"image_id": imageID,
	})
}

// UpdateImageDetailsRequest represents image details update payload
type UpdateImageDetailsRequest struct {
	Description string `json:"description" binding:"max=200"`
	AltText     string `json:"alt_text" binding:"max=100"`
}

// UpdateImageDetailsHandler updates image description and alt text
func UpdateImageDetailsHandler(c *gin.Context) {
	userIDParam := c.Param("id")
	imageIDParam := c.Param("image_id")

	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	imageID, err := strconv.ParseUint(imageIDParam, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid image ID")
		return
	}

	// Get authenticated user ID
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	// Users can only update their own images
	if uint(userID) != authenticatedUserID.(uint) {
		utils.RespondError(c, http.StatusForbidden, "cannot update another user's image")
		return
	}

	var req UpdateImageDetailsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid image details: "+err.Error())
		return
	}

	// Find and update the image
	var image models.Image
	if err := conf.DB.Where("id = ? AND user_id = ? AND is_active = ?", imageID, userID, true).First(&image).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "image not found")
		return
	}

	image.Description = req.Description
	image.AltText = req.AltText

	if err := conf.DB.Save(&image).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to update image details")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "Image details updated successfully",
		"image": gin.H{
			"id":          image.ID,
			"description": image.Description,
			"alt_text":    image.AltText,
			"updated_at":  image.UpdatedAt,
		},
	})
}