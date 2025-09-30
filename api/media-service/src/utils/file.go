package utils

import (
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
}

// IsAllowedFile checks if the file extension is allowed
func IsAllowedFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	return allowedExtensions[ext]
}

// GenerateUniqueFilename generates a unique filename while preserving the extension
func GenerateUniqueFilename(originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	if ext == "" {
		ext = ".jpg" // default extension
	}

	// Generate UUID-based filename
	id := uuid.New()
	return fmt.Sprintf("%s%s", id.String(), ext)
}

// GetMimeType determines the MIME type from file header
func GetMimeType(file *multipart.FileHeader) string {
	if file.Header.Get("Content-Type") != "" {
		return file.Header.Get("Content-Type")
	}

	// Fallback based on extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	default:
		return "image/jpeg"
	}
}