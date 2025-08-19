package services

import (
	"fmt"
	"log"

	"gorm.io/gorm"

	models "auth-service/src/models"
)


func createUserTags(tx *gorm.DB, userID uint, tagNames []string) error {
	if len(tagNames) == 0 {
		log.Printf("No tags provided for user %d", userID)
		return nil
	}

	log.Printf("Creating tags for user %d: %v", userID, tagNames)

	// 1. Insérer les tags individuellement pour éviter les problèmes avec ON CONFLICT
	for _, name := range tagNames {
		tag := models.Tag{Name: name}
		result := tx.Where("name = ?", name).FirstOrCreate(&tag)
		if result.Error != nil {
			log.Printf("Error creating/finding tag %s: %v", name, result.Error)
			return fmt.Errorf("failed to create/find tag %s: %w", name, result.Error)
		}
		log.Printf("Tag %s has ID %d", name, tag.ID)
	}

	// 2. Récupérer tous les tags créés/trouvés
	var dbTags []models.Tag
	if err := tx.Where("name IN ?", tagNames).Find(&dbTags).Error; err != nil {
		log.Printf("Error fetching tags: %v", err)
		return fmt.Errorf("failed to fetch tags: %w", err)
	}

	log.Printf("Found %d tags in database", len(dbTags))

	// 3. Créer les associations user-tags
	for _, tag := range dbTags {
		userTag := models.UserTag{
			UserID: userID,
			TagID:  tag.ID,
		}
		
		result := tx.Where("user_id = ? AND tag_id = ?", userID, tag.ID).FirstOrCreate(&userTag)
		if result.Error != nil {
			log.Printf("Error creating user_tag association for user %d, tag %d: %v", userID, tag.ID, result.Error)
			return fmt.Errorf("failed to create user_tag association: %w", result.Error)
		}
		log.Printf("Created user_tag association: user %d, tag %d (%s)", userID, tag.ID, tag.Name)
	}

	log.Printf("Successfully created %d tag associations for user %d", len(dbTags), userID)
	return nil
}
