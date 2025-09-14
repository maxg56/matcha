package services

import (
	"errors"
	"time"

	"gorm.io/gorm"

	"match-service/src/conf"
	"match-service/src/models"
)

type RewindService struct {
	db *gorm.DB
}

func NewRewindService() *RewindService {
	return &RewindService{
		db: conf.DB,
	}
}

// GetRewindAvailability checks if user can rewind their last action
func (rs *RewindService) GetRewindAvailability(userID int) (*models.RewindAvailability, error) {
	availability := &models.RewindAvailability{
		CanRewind: false,
	}

	// Get the last interaction by the user (within last 10 minutes)
	var lastInteraction models.UserInteraction
	tenMinutesAgo := time.Now().Add(-10 * time.Minute)

	err := rs.db.Where("user_id = ? AND created_at > ?", userID, tenMinutesAgo).
		Order("created_at DESC").
		First(&lastInteraction).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			reason := "No recent interactions to rewind"
			availability.Reason = &reason
			return availability, nil
		}
		return nil, err
	}

	// Check if this interaction was already rewound
	var existingRewind models.Rewind
	err = rs.db.Where("original_interaction_id = ? AND is_used = true", lastInteraction.ID).
		First(&existingRewind).Error

	if err == nil {
		reason := "This interaction has already been rewound"
		availability.Reason = &reason
		return availability, nil
	}

	// Check if there's an unused rewind for this interaction
	var unusedRewind models.Rewind
	err = rs.db.Where("original_interaction_id = ? AND is_used = false", lastInteraction.ID).
		First(&unusedRewind).Error

	if err == nil {
		// Check if rewind has expired
		if time.Now().After(unusedRewind.ExpiresAt) {
			reason := "Rewind has expired"
			availability.Reason = &reason
			return availability, nil
		}

		// Rewind is available
		availability.CanRewind = true
		availability.LastInteractionID = &lastInteraction.ID
		availability.LastInteractionType = &lastInteraction.InteractionType
		availability.ExpiresAt = &unusedRewind.ExpiresAt

		timeRemaining := int(unusedRewind.ExpiresAt.Sub(time.Now()).Seconds())
		availability.TimeRemaining = &timeRemaining

		return availability, nil
	}

	// No existing rewind, create one
	expiresAt := lastInteraction.CreatedAt.Add(10 * time.Minute)
	if time.Now().After(expiresAt) {
		reason := "Interaction too old to rewind (max 10 minutes)"
		availability.Reason = &reason
		return availability, nil
	}

	// Create rewind record
	rewind := models.Rewind{
		UserID:                uint(userID),
		OriginalInteractionID: lastInteraction.ID,
		RewindType:           lastInteraction.InteractionType,
		ExpiresAt:            expiresAt,
		IsUsed:               false,
	}

	err = rs.db.Create(&rewind).Error
	if err != nil {
		return nil, err
	}

	// Set availability
	availability.CanRewind = true
	availability.LastInteractionID = &lastInteraction.ID
	availability.LastInteractionType = &lastInteraction.InteractionType
	availability.ExpiresAt = &expiresAt

	timeRemaining := int(expiresAt.Sub(time.Now()).Seconds())
	availability.TimeRemaining = &timeRemaining

	return availability, nil
}

// PerformRewind executes the rewind action
func (rs *RewindService) PerformRewind(userID int) error {
	// Get the available rewind
	availability, err := rs.GetRewindAvailability(userID)
	if err != nil {
		return err
	}

	if !availability.CanRewind {
		reason := "No rewind available"
		if availability.Reason != nil {
			reason = *availability.Reason
		}
		return errors.New(reason)
	}

	// Start transaction
	tx := rs.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Mark the rewind as used
	err = tx.Where("original_interaction_id = ? AND is_used = false", *availability.LastInteractionID).
		Update("is_used", true).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	// Delete the original interaction
	err = tx.Delete(&models.UserInteraction{}, *availability.LastInteractionID).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	// If it was a like that created a match, we should also handle the match deletion
	// This would require additional logic to check if this interaction created a match

	return tx.Commit().Error
}

// CleanupExpiredRewinds removes expired rewind records
func (rs *RewindService) CleanupExpiredRewinds() error {
	return rs.db.Where("expires_at < ? AND is_used = false", time.Now()).
		Delete(&models.Rewind{}).Error
}