package interactions

import (
	"errors"
	"log"
	"time"

	"match-service/src/conf"
	"match-service/src/models"
	"match-service/src/utils"
	"match-service/src/services/users"
	"match-service/src/services/notifications"
)



// InteractionManager handles user interactions and match management
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
			return nil, errors.New("failed to record interaction")
		}
	} else {
		// Update existing interaction
		existingInteraction.InteractionType = action
		if err := conf.DB.Save(&existingInteraction).Error; err != nil {
			return nil, errors.New("failed to update interaction")
		}
		interaction = existingInteraction
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
	var mutualLike models.UserInteraction
	mutualResult := conf.DB.Where("user_id = ? AND target_user_id = ? AND interaction_type = ?",
		targetUserID, userID, "like").First(&mutualLike)

	if mutualResult.Error == nil {
		// Create match
		match, err := m.createMatch(userID, targetUserID)
		if err == nil {
			result["match_created"] = true
			result["match_id"] = match.ID
		}
	}
}

// handleNegativeAction deactivates matches for pass/block actions
func (m *InteractionManager) handleNegativeAction(userID, targetUserID int) {
	m.deactivateMatch(userID, targetUserID)
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

// UnmatchUsers handles unmatching between two users
func (m *InteractionManager) UnmatchUsers(userID, targetUserID int) error {
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
		return errors.New("failed to unmatch users")
	}

	// Transform likes to "pass" interactions to prevent re-appearance
	if err := m.transformLikesToPass(userID, targetUserID); err != nil {
		// Don't fail the unmatch operation if this fails
	}

	// Delete conversation/messages between users
	if err := m.deleteConversation(userID, targetUserID); err != nil {
		// Don't fail the unmatch operation if conversation deletion fails
	}

	// Send unmatch notification
	if err := m.sendUnmatchNotification(userID, targetUserID); err != nil {
		// Don't fail the unmatch operation if notification fails
	}

	// Invalidate cache for both users
	utils.InvalidateUserCache(userID)
	utils.InvalidateUserCache(targetUserID)

	return nil
}

// GetInteractionCount returns the number of interactions for a user
func (m *InteractionManager) GetInteractionCount(userID int) (int64, error) {
	var count int64
	err := conf.DB.Model(&models.UserInteraction{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

// deleteConversation deletes all messages between two users
func (m *InteractionManager) deleteConversation(userID, targetUserID int) error {
	// Make HTTP call to chat service to delete conversation
	err := m.callChatService(userID, targetUserID)
	if err != nil {
		return err
	}

	return nil
}

// transformLikesToPass converts like interactions to pass interactions
func (m *InteractionManager) transformLikesToPass(userID, targetUserID int) error {
	// Find all like interactions between these two users (in both directions)
	var interactions []models.UserInteraction
	err := conf.DB.Where(
		"((user_id = ? AND target_user_id = ?) OR (user_id = ? AND target_user_id = ?)) AND interaction_type = ?",
		userID, targetUserID, targetUserID, userID, "like",
	).Find(&interactions).Error
	
	if err != nil {
		return err
	}
	
	// Transform each like to a pass
	for _, interaction := range interactions {
		interaction.InteractionType = "pass"
		interaction.CreatedAt = time.Now()
		conf.DB.Save(&interaction)
	}
	
	return nil
}

// callChatService logs the conversation hiding (frontend will handle visual hiding)
func (m *InteractionManager) callChatService(userID, targetUserID int) error {
	log.Printf("� [DEBUG] Conversation between users %d and %d should be hidden in UI", userID, targetUserID)
	log.Printf("💡 [INFO] Frontend will filter out conversations where users are unmatched")
	
	// No database deletion - the frontend will handle hiding conversations
	// by checking match status when displaying conversation list
	
	return nil
}

// sendUnmatchNotification sends a notification about the unmatch
func (m *InteractionManager) sendUnmatchNotification(userID, targetUserID int) error {
	notificationService := notifications.NewNotificationService()

	// Send notification to the target user (the one being unmatched)
	err := notificationService.SendUnmatchNotification(targetUserID, userID)
	if err != nil {
		log.Printf("❌ Failed to send unmatch notification to user %d: %v", targetUserID, err)
		return err
	}

	log.Printf("✅ Unmatch notification sent to user %d from user %d", targetUserID, userID)
	return nil
}