package services

import (
	"errors"
	"log"

	"match-service/src/conf"
	"match-service/src/models"
	"match-service/src/utils"
)

// InteractionManager handles user interactions and match creation
type InteractionManager struct {
	updater *PreferenceUpdater
}

// NewInteractionManager creates a new InteractionManager instance
func NewInteractionManager(learningRate float64) *InteractionManager {
	return &InteractionManager{
		updater: NewPreferenceUpdater(learningRate),
	}
}

// RecordInteraction records a user interaction and handles match logic
func (m *InteractionManager) RecordInteraction(userID, targetUserID int, action string) (map[string]interface{}, error) {
	// Validate users exist
	userService := NewUserService()
	if err := userService.ValidateUserExists(userID); err != nil {
		return nil, err
	}
	if err := userService.ValidateUserExists(targetUserID); err != nil {
		return nil, err
	}

	// Create or update interaction record using upsert
	interaction := models.UserInteraction{
		UserID:          uint(userID),
		TargetUserID:    uint(targetUserID),
		InteractionType: action,
	}

	// Use ON CONFLICT clause to handle duplicate interactions
	dbResult := conf.DB.Exec(`
		INSERT INTO user_interactions (user_id, target_user_id, interaction_type, created_at)
		VALUES (?, ?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT (user_id, target_user_id)
		DO UPDATE SET
			interaction_type = EXCLUDED.interaction_type,
			created_at = CURRENT_TIMESTAMP
	`, userID, targetUserID, action)

	if dbResult.Error != nil {
		return nil, errors.New("failed to record interaction")
	}

	// Update user preferences based on the interaction
	if err := m.updater.UpdateUserPreferences(userID, targetUserID, action); err != nil {
		log.Printf("Warning: Failed to update user preferences: %v", err)
	}

	// Invalidate cache for this user
	utils.InvalidateUserCache(userID)

	result := map[string]interface{}{
		"interaction_id": interaction.ID,
		"user_id":        userID,
		"target_user_id": targetUserID,
		"action":         action,
		"timestamp":      interaction.CreatedAt,
		"message":        "Interaction recorded successfully",
	}

	// Handle match logic based on action
	switch action {
	case "like":
		m.handleLikeAction(userID, targetUserID, result)
	case "pass", "block":
		m.handleNegativeAction(userID, targetUserID)
	}

	return result, nil
}

// handleLikeAction checks for mutual likes and creates matches
func (m *InteractionManager) handleLikeAction(userID, targetUserID int, result map[string]interface{}) {
	var mutualLike models.UserInteraction
	mutualResult := conf.DB.Where("user_id = ? AND target_user_id = ? AND interaction_type = ?",
		targetUserID, userID, "like").First(&mutualLike)

	if mutualResult.Error == nil {
		// Create match
		match, err := m.createMatch(userID, targetUserID)
		if err == nil {
			result["match_created"] = true
			result["match_id"] = match.ID
			log.Printf("Match created between users %d and %d", userID, targetUserID)
		} else {
			log.Printf("Failed to create match between users %d and %d: %v", userID, targetUserID, err)
		}
	}
}

// handleNegativeAction deactivates matches for pass/block actions
func (m *InteractionManager) handleNegativeAction(userID, targetUserID int) {
	if err := m.deactivateMatch(userID, targetUserID); err != nil {
		log.Printf("Warning: Failed to deactivate match: %v", err)
	}
}

// createMatch creates a new match between two users
func (m *InteractionManager) createMatch(userID, targetUserID int) (*models.Match, error) {
	match := models.Match{
		User1ID:  uint(userID),
		User2ID:  uint(targetUserID),
		IsActive: true,
	}

	// Ensure consistent ordering (smaller ID first)
	if userID > targetUserID {
		match.User1ID = uint(targetUserID)
		match.User2ID = uint(userID)
	}

	// Check if match already exists
	var existingMatch models.Match
	result := conf.DB.Where("user1_id = ? AND user2_id = ?",
		match.User1ID, match.User2ID).First(&existingMatch)

	if result.Error != nil {
		// Create new match
		if err := conf.DB.Create(&match).Error; err != nil {
			return nil, err
		}
		return &match, nil
	} else {
		// Reactivate existing match
		existingMatch.IsActive = true
		if err := conf.DB.Save(&existingMatch).Error; err != nil {
			return nil, err
		}
		return &existingMatch, nil
	}
}

// deactivateMatch deactivates a match between two users
func (m *InteractionManager) deactivateMatch(userID, targetUserID int) error {
	// Determine correct ordering
	user1ID, user2ID := userID, targetUserID
	if userID > targetUserID {
		user1ID, user2ID = targetUserID, userID
	}

	var match models.Match
	result := conf.DB.Where("user1_id = ? AND user2_id = ?", user1ID, user2ID).First(&match)

	if result.Error == nil {
		match.IsActive = false
		conf.DB.Save(&match)
	}

	return nil
}

// GetInteractionCount returns the number of interactions for a user
func (m *InteractionManager) GetInteractionCount(userID int) (int64, error) {
	var count int64
	err := conf.DB.Model(&models.UserInteraction{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}