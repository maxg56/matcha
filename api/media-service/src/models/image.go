package models

import (
	"time"
)

// Image represents the images table
type Image struct {
	ID           uint      `gorm:"primaryKey;column:id" json:"id"`
	UserID       uint      `gorm:"column:user_id;not null;index" json:"user_id"`
	Filename     string    `gorm:"column:filename;not null;unique;size:255" json:"filename"`
	OriginalName string    `gorm:"column:original_name;not null;size:255" json:"original_name"`
	FilePath     string    `gorm:"column:file_path;not null;size:500" json:"file_path"`
	FileSize     int64     `gorm:"column:file_size;not null" json:"file_size"`
	MimeType     string    `gorm:"column:mime_type;not null;size:100" json:"mime_type"`
	Width        *int      `gorm:"column:width" json:"width"`
	Height       *int      `gorm:"column:height" json:"height"`
	IsProfile    bool      `gorm:"column:is_profile;default:false" json:"is_profile"`
	IsActive     bool      `gorm:"column:is_active;default:true" json:"is_active"`
	CreatedAt    time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	Description  *string   `gorm:"column:description;type:text" json:"description"`
	AltText      *string   `gorm:"column:alt_text;size:255" json:"alt_text"`
}

func (Image) TableName() string {
	return "images"
}

// ToMap converts the Image struct to a map for JSON responses
func (img *Image) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"id":            img.ID,
		"user_id":       img.UserID,
		"filename":      img.Filename,
		"original_name": img.OriginalName,
		"file_size":     img.FileSize,
		"mime_type":     img.MimeType,
		"width":         img.Width,
		"height":        img.Height,
		"is_profile":    img.IsProfile,
		"is_active":     img.IsActive,
		"created_at":    img.CreatedAt,
		"updated_at":    img.UpdatedAt,
		"description":   img.Description,
		"alt_text":      img.AltText,
	}
}