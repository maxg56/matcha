package interactions

import (
	"errors"
	"log"

	"match-service/src/conf"
	"match-service/src/models"
	"match-service/src/utils"
	"match-service/src/services/users"
)

// InteractionManager handles user interactions and match creation
type InteractionManager struct {}

// NewInteractionManager creates a new InteractionManager instance
func NewInteractionManager() *InteractionManager {
	return &InteractionManager{}
}

// RecordInteraction records a user interaction and handles match logic
func (m *InteractionManager) RecordInteraction(userID, targetUserID int, action string) (map[string]interface{}, error) {
	// Validate users exist
	userService := users.NewUserService()
	if err := userService.ValidateUserExists(userID); err != nil {
		return nil, err
	}
	if err := userService.ValidateUserExists(targetUserID); err != nil {
		return nil, err
	}

	// Create or update interaction record using upsert
	log.Printf("🔍 [DEBUG Interaction] Recording interaction: user %d -> user %d (%s)", userID, targetUserID, action)

	// Check if interaction already exists
	var existingInteraction models.UserInteraction
	result := conf.DB.Where("user_id = ? AND target_user_id = ?", userID, targetUserID).First(&existingInteraction)

	var interaction models.UserInteraction
	if result.Error != nil {
		// Create new interaction
		interaction = models.UserInteraction{
			UserID:          uint(userID),
			TargetUserID:    uint(targetUserID),
			InteractionType: action,
		}
		if err := conf.DB.Create(&interaction).Error; err != nil {
			log.Printf("❌ [ERROR Interaction] Failed to create interaction: %v", err)
			return nil, errors.New("failed to record interaction")
		}
		log.Printf("✅ [SUCCESS Interaction] New interaction created: user %d -> user %d (%s) with ID: %d", userID, targetUserID, action, interaction.ID)
	} else {
		// Update existing interaction
		existingInteraction.InteractionType = action
		if err := conf.DB.Save(&existingInteraction).Error; err != nil {
			log.Printf("❌ [ERROR Interaction] Failed to update interaction: %v", err)
			return nil, errors.New("failed to update interaction")
		}
		interaction = existingInteraction
		log.Printf("✅ [SUCCESS Interaction] Interaction updated: user %d -> user %d (%s) with ID: %d", userID, targetUserID, action, interaction.ID)
	}

	// Invalidate cache for this user
	utils.InvalidateUserCache(userID)

	resultMap := map[string]interface{}{
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
		m.handleLikeAction(userID, targetUserID, resultMap)
	case "pass", "block":
		m.handleNegativeAction(userID, targetUserID)
	}

	return resultMap, nil
}

// handleLikeAction checks for mutual likes and creates matches
func (m *InteractionManager) handleLikeAction(userID, targetUserID int, result map[string]interface{}) {
	log.Printf("🔍 [DEBUG Match] Checking for mutual like: user %d liked user %d", userID, targetUserID)

	var mutualLike models.UserInteraction
	mutualResult := conf.DB.Where("user_id = ? AND target_user_id = ? AND interaction_type = ?",
		targetUserID, userID, "like").First(&mutualLike)

	if mutualResult.Error == nil {
		log.Printf("✅ [DEBUG Match] Mutual like found! User %d had already liked user %d", targetUserID, userID)
		// Create match
		match, err := m.createMatch(userID, targetUserID)
		if err == nil {
			result["match_created"] = true
			result["match_id"] = match.ID
			log.Printf("✅ [SUCCESS] Match created between users %d and %d with ID: %d", userID, targetUserID, match.ID)
		} else {
			log.Printf("❌ [ERROR Match] Failed to create match between users %d and %d: %v", userID, targetUserID, err)
		}
	} else {
		log.Printf("🔍 [DEBUG Match] No mutual like found. User %d has not liked user %d yet. Error: %v", targetUserID, userID, mutualResult.Error)
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
	log.Printf("🔍 [DEBUG Match] Creating match between users %d and %d", userID, targetUserID)

	match := models.Match{
		User1ID:  uint(userID),
		User2ID:  uint(targetUserID),
		IsActive: true,
	}

	// Ensure consistent ordering (smaller ID first)
	if userID > targetUserID {
		match.User1ID = uint(targetUserID)
		match.User2ID = uint(userID)
		log.Printf("🔍 [DEBUG Match] Reordered IDs: user1_id=%d, user2_id=%d", match.User1ID, match.User2ID)
	} else {
		log.Printf("🔍 [DEBUG Match] Using original order: user1_id=%d, user2_id=%d", match.User1ID, match.User2ID)
	}

	// Check if match already exists
	var existingMatch models.Match
	result := conf.DB.Where("user1_id = ? AND user2_id = ?",
		match.User1ID, match.User2ID).First(&existingMatch)

	if result.Error != nil {
		log.Printf("🔍 [DEBUG Match] No existing match found, creating new match")
		// Create new match
		if err := conf.DB.Create(&match).Error; err != nil {
			log.Printf("❌ [ERROR Match] Failed to create new match: %v", err)
			return nil, err
		}
		log.Printf("✅ [SUCCESS] New match created with ID: %d", match.ID)
		return &match, nil
	} else {
		log.Printf("🔍 [DEBUG Match] Existing match found (ID: %d), reactivating", existingMatch.ID)
		// Reactivate existing match
		existingMatch.IsActive = true
		if err := conf.DB.Save(&existingMatch).Error; err != nil {
			log.Printf("❌ [ERROR Match] Failed to reactivate existing match: %v", err)
			return nil, err
		}
		log.Printf("✅ [SUCCESS] Existing match reactivated (ID: %d)", existingMatch.ID)
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

// UnmatchUsers handles unmatching between two users
func (m *InteractionManager) UnmatchUsers(userID, targetUserID int) error {
	log.Printf("🔍 [DEBUG Unmatch] Processing unmatch between users %d and %d", userID, targetUserID)

	// Validate users exist
	userService := users.NewUserService()
	if err := userService.ValidateUserExists(userID); err != nil {
		return err
	}
	if err := userService.ValidateUserExists(targetUserID); err != nil {
		return err
	}

	// Deactivate the match
	if err := m.deactivateMatch(userID, targetUserID); err != nil {
		log.Printf("❌ [ERROR Unmatch] Failed to deactivate match: %v", err)
		return errors.New("failed to unmatch users")
	}

	// Invalidate cache for both users
	utils.InvalidateUserCache(userID)
	utils.InvalidateUserCache(targetUserID)

	log.Printf("✅ [SUCCESS Unmatch] Successfully unmatched users %d and %d", userID, targetUserID)
	return nil
}

// GetInteractionCount returns the number of interactions for a user
func (m *InteractionManager) GetInteractionCount(userID int) (int64, error) {
	var count int64
	err := conf.DB.Model(&models.UserInteraction{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}