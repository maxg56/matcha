package utils

import (
	"database/sql"
	"fmt"

	"gorm.io/gorm"

	"user-service/src/models"
)

// SetNullString sets a sql.NullString field if value is provided
func SetNullString(field *sql.NullString, value *string) {
	if value != nil {
		field.String = *value
		field.Valid = true
	}
}

// UpdateUserTags replaces all user tags with new ones
func UpdateUserTags(tx *gorm.DB, userID uint, tagNames []string) error {
	// Delete existing user_tags
	if err := tx.Where("user_id = ?", userID).Delete(&models.UserTag{}).Error; err != nil {
		return fmt.Errorf("failed to delete existing tags: %w", err)
	}

	// Create new user_tags
	for _, tagName := range tagNames {
		// Find or create tag
		var tag models.Tag
		if err := tx.Where("name = ?", tagName).FirstOrCreate(&tag, models.Tag{Name: tagName}).Error; err != nil {
			return fmt.Errorf("failed to create tag %s: %w", tagName, err)
		}

		// Create user_tag association
		userTag := models.UserTag{
			UserID: userID,
			TagID:  tag.ID,
		}
		if err := tx.Create(&userTag).Error; err != nil {
			return fmt.Errorf("failed to create user_tag association: %w", err)
		}
	}
	return nil
}
