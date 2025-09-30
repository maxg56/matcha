package handlers

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"media-service/src/conf"
	"media-service/src/models"
	"media-service/src/utils"

	"github.com/gin-gonic/gin"
)

// GetFileHandler serves uploaded files
func GetFileHandler(c *gin.Context) {
	filename := c.Param("filename")
	if filename == "" {
		utils.RespondError(c, "Filename is required", 400)
		return
	}

	// Verify file exists in database and is active
	var imageRecord models.Image
	if err := conf.DB.Where("filename = ? AND is_active = ?", filename, true).First(&imageRecord).Error; err != nil {
		log.Printf("File not found in database: %s", filename)
		utils.RespondError(c, "File not found", 404)
		return
	}

	// Check if file exists on disk
	filePath := filepath.Join("/app/uploads", filename)
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		log.Printf("File not found on disk: %s", filePath)
		utils.RespondError(c, "File not found", 404)
		return
	}

	// Set proper content type
	c.Header("Content-Type", imageRecord.MimeType)
	c.Header("Cache-Control", "public, max-age=86400") // 24 hours cache

	// Serve the file
	c.File(filePath)
}

// ServeUploadHandler serves files directly from uploads folder (for compatibility)
func ServeUploadHandler(c *gin.Context) {
	filename := c.Param("filename")
	if filename == "" {
		utils.RespondError(c, "Filename is required", 400)
		return
	}

	// Security: prevent directory traversal
	safeName := filepath.Base(filename)
	filePath := filepath.Join("/app/uploads", safeName)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		log.Printf("File not found: %s", filePath)
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	log.Printf("Serving file: %s", filePath)
	c.File(filePath)
}