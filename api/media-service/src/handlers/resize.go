package handlers

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"media-service/src/conf"
	"media-service/src/models"
	"media-service/src/utils"

	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
)

// ResizeImageHandler handles image resizing requests
func ResizeImageHandler(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, "Authentication required", 401)
		return
	}

	var request struct {
		Filename string `json:"filename" binding:"required"`
		Width    int    `json:"width" binding:"required,min=1,max=4096"`
		Height   int    `json:"height" binding:"required,min=1,max=4096"`
		Quality  *int   `json:"quality,omitempty"` // Optional, default 95
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		utils.RespondError(c, "Invalid request data", 400)
		return
	}

	// Set default quality if not provided
	quality := 95
	if request.Quality != nil && *request.Quality > 0 && *request.Quality <= 100 {
		quality = *request.Quality
	}

	// Find the original image record
	var originalImage models.Image
	if err := conf.DB.Where("filename = ? AND user_id = ? AND is_active = ?",
		request.Filename, userID, true).First(&originalImage).Error; err != nil {
		utils.RespondError(c, "Original image not found or access denied", 404)
		return
	}

	// Generate filename for resized image
	ext := filepath.Ext(originalImage.Filename)
	baseName := originalImage.Filename[:len(originalImage.Filename)-len(ext)]
	resizedFilename := fmt.Sprintf("%s_%dx%d%s", baseName, request.Width, request.Height, ext)
	resizedFilePath := filepath.Join("/app/uploads", resizedFilename)

	// Check if resized version already exists
	var existingResized models.Image
	if err := conf.DB.Where("filename = ? AND is_active = ?", resizedFilename, true).First(&existingResized).Error; err == nil {
		// Return existing resized image
		fileURL := fmt.Sprintf("/api/v1/media/get/%s", resizedFilename)
		response := map[string]interface{}{
			"id":            existingResized.ID,
			"filename":      resizedFilename,
			"url":           fileURL,
			"original_name": existingResized.OriginalName,
			"file_size":     existingResized.FileSize,
			"width":         existingResized.Width,
			"height":        existingResized.Height,
			"mime_type":     existingResized.MimeType,
		}
		utils.RespondSuccess(c, response, "Resized image already exists")
		return
	}

	// Open original image
	originalImg, err := imaging.Open(originalImage.FilePath)
	if err != nil {
		log.Printf("Failed to open original image: %v", err)
		utils.RespondError(c, "Failed to open original image", 500)
		return
	}

	// Resize image
	resizedImg := imaging.Resize(originalImg, request.Width, request.Height, imaging.Lanczos)

	// Save resized image
	var saveErr error
	switch filepath.Ext(resizedFilename) {
	case ".jpg", ".jpeg":
		saveErr = imaging.Save(resizedImg, resizedFilePath, imaging.JPEGQuality(quality))
	case ".png":
		saveErr = imaging.Save(resizedImg, resizedFilePath)
	case ".gif":
		saveErr = imaging.Save(resizedImg, resizedFilePath)
	case ".webp":
		saveErr = imaging.Save(resizedImg, resizedFilePath)
	default:
		saveErr = imaging.Save(resizedImg, resizedFilePath, imaging.JPEGQuality(quality))
	}

	if saveErr != nil {
		log.Printf("Failed to save resized image: %v", saveErr)
		utils.RespondError(c, "Failed to save resized image", 500)
		return
	}

	// Get file info
	fileInfo, err := os.Stat(resizedFilePath)
	if err != nil {
		log.Printf("Failed to get file info: %v", err)
		utils.RespondError(c, "Failed to get file info", 500)
		return
	}

	// Create database record for resized image
	resizedRecord := models.Image{
		UserID:       userID.(uint),
		Filename:     resizedFilename,
		OriginalName: fmt.Sprintf("%s (resized %dx%d)", originalImage.OriginalName, request.Width, request.Height),
		FilePath:     resizedFilePath,
		FileSize:     fileInfo.Size(),
		MimeType:     originalImage.MimeType,
		Width:        &request.Width,
		Height:       &request.Height,
		IsActive:     true,
	}

	if err := conf.DB.Create(&resizedRecord).Error; err != nil {
		log.Printf("Failed to save resized image record: %v", err)
		// Clean up file if database save failed
		os.Remove(resizedFilePath)
		utils.RespondError(c, "Failed to save resized image record", 500)
		return
	}

	// Generate public URL
	fileURL := fmt.Sprintf("/api/v1/media/get/%s", resizedFilename)

	log.Printf("Image resized successfully: %s -> %s for user %v", request.Filename, resizedFilename, userID)

	// Return response
	response := map[string]interface{}{
		"id":            resizedRecord.ID,
		"filename":      resizedFilename,
		"url":           fileURL,
		"original_name": resizedRecord.OriginalName,
		"file_size":     resizedRecord.FileSize,
		"width":         resizedRecord.Width,
		"height":        resizedRecord.Height,
		"mime_type":     resizedRecord.MimeType,
	}

	utils.RespondSuccess(c, response, "Image resized successfully")
}