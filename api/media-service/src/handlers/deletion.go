package handlers

import (
	"log"
	"os"

	"media-service/src/conf"
	"media-service/src/models"
	"media-service/src/utils"

	"github.com/gin-gonic/gin"
)

// DeleteFileHandler handles file deletion requests
func DeleteFileHandler(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, "Authentication required", 401)
		return
	}

	filename := c.Param("filename")
	if filename == "" {
		utils.RespondError(c, "Filename is required", 400)
		return
	}

	// Find the image record
	var image models.Image
	if err := conf.DB.Where("filename = ? AND user_id = ? AND is_active = ?",
		filename, userID, true).First(&image).Error; err != nil {
		utils.RespondError(c, "File not found or access denied", 404)
		return
	}

	// Start transaction
	tx := conf.DB.Begin()

	// Soft delete in database (mark as inactive)
	image.IsActive = false
	image.IsProfile = false // Remove profile status if it was set
	if err := tx.Save(&image).Error; err != nil {
		tx.Rollback()
		log.Printf("Failed to soft delete image: %v", err)
		utils.RespondError(c, "Failed to delete image", 500)
		return
	}

	// Commit database transaction first
	tx.Commit()

	// Then try to delete physical file (non-critical if it fails)
	if err := os.Remove(image.FilePath); err != nil {
		log.Printf("Warning: Failed to delete physical file %s: %v", image.FilePath, err)
		// Don't return error here as the database operation succeeded
	}

	log.Printf("File deleted successfully: %s for user %v", filename, userID)
	utils.RespondSuccess(c, map[string]interface{}{
		"filename": filename,
		"deleted":  true,
	}, "File deleted successfully")
}