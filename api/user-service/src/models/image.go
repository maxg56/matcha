package models

import (
	"fmt"
	"os"
	"time"
)

// Image represents user profile images - matches media-service schema
type Image struct {
	ID           uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID       uint      `gorm:"column:user_id;not null" json:"user_id"`
	Filename     string    `gorm:"column:filename;not null" json:"filename"`
	OriginalName string    `gorm:"column:original_name" json:"original_name"`
	FilePath     string    `gorm:"column:file_path" json:"file_path"`
	FileSize     int       `gorm:"column:file_size" json:"file_size"`
	MimeType     string    `gorm:"column:mime_type" json:"mime_type"`
	Width        int       `gorm:"column:width" json:"width"`
	Height       int       `gorm:"column:height" json:"height"`
	IsProfile    bool      `gorm:"column:is_profile;default:false" json:"is_profile"`
	IsActive     bool      `gorm:"column:is_active;default:true" json:"is_active"`
	Description  string    `gorm:"column:description" json:"description"`
	AltText      string    `gorm:"column:alt_text" json:"alt_text"`
	CreatedAt    time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`

	// Relations
	User User `gorm:"foreignKey:UserID;references:ID"`
}

func (Image) TableName() string { return "images" }

// URL generates the public URL for the image
func (i *Image) URL() string {
	baseURL := os.Getenv("MEDIA_BASE_URL")
	if baseURL == "" {
		baseURL = "https://localhost:8443/api/v1/media"
	}
	return fmt.Sprintf("%s/get/%s", baseURL, i.Filename)
}
