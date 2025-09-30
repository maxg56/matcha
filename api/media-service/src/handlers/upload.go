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

const (
	uploadFolder = "/app/uploads"
	maxFileSize  = 16 * 1024 * 1024 // 16MB
)

// UploadHandler handles file upload requests
func UploadHandler(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, "Authentication required", 401)
		return
	}

	// Get file from request (support both 'image' and 'file' fields)
	file, err := c.FormFile("image")
	if err != nil {
		file, err = c.FormFile("file")
		if err != nil {
			utils.RespondError(c, "No file part in request", 400)
			return
		}
	}

	// Check if file was selected
	if file.Filename == "" {
		utils.RespondError(c, "No file selected", 400)
		return
	}

	// Check file size
	if file.Size > maxFileSize {
		utils.RespondError(c, "File too large. Maximum size is 16MB", 400)
		return
	}

	// Check file type
	if !utils.IsAllowedFile(file.Filename) {
		utils.RespondError(c, "File type not allowed. Allowed types: jpg, jpeg, png, gif, webp", 400)
		return
	}

	// Generate unique filename
	uniqueFilename := utils.GenerateUniqueFilename(file.Filename)
	filePath := filepath.Join(uploadFolder, uniqueFilename)

	// Create upload directory if it doesn't exist
	if err := os.MkdirAll(uploadFolder, 0755); err != nil {
		log.Printf("Failed to create upload directory: %v", err)
		utils.RespondError(c, "Failed to create upload directory", 500)
		return
	}

	// Save file to disk
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		log.Printf("Failed to save file: %v", err)
		utils.RespondError(c, "Failed to save file", 500)
		return
	}

	// Get image dimensions
	var width, height *int
	if img, err := imaging.Open(filePath); err == nil {
		bounds := img.Bounds()
		w, h := bounds.Dx(), bounds.Dy()
		width = &w
		height = &h
	}

	// Get MIME type
	mimeType := utils.GetMimeType(file)

	// Create database record
	imageRecord := models.Image{
		UserID:       userID.(uint),
		Filename:     uniqueFilename,
		OriginalName: file.Filename,
		FilePath:     filePath,
		FileSize:     file.Size,
		MimeType:     mimeType,
		Width:        width,
		Height:       height,
		IsActive:     true,
	}

	// Save to database
	if err := conf.DB.Create(&imageRecord).Error; err != nil {
		log.Printf("Failed to save image record: %v", err)
		// Clean up file if database save failed
		os.Remove(filePath)
		utils.RespondError(c, "Failed to save image record", 500)
		return
	}

	// Generate public URL
	fileURL := fmt.Sprintf("/api/v1/media/get/%s", uniqueFilename)

	log.Printf("File uploaded successfully: %s for user %v", uniqueFilename, userID)

	// Return response
	response := map[string]interface{}{
		"id":            imageRecord.ID,
		"filename":      uniqueFilename,
		"url":           fileURL,
		"original_name": file.Filename,
		"file_size":     file.Size,
		"width":         width,
		"height":        height,
		"mime_type":     mimeType,
	}

	utils.RespondSuccess(c, response, "File uploaded successfully")
}