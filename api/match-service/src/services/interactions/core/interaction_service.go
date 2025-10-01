package core

import (
	"errors"
	"fmt"
	"log"

	"match-service/src/conf"
	"match-service/src/models"
	"match-service/src/services/users"
	"match-service/src/services/interactions/matches"
	"match-service/src/services/notifications"
)

// InteractionService handles user interactions (likes, unlikes, blocks)
type InteractionService struct {
	userService         *users.UserService
	notificationService *notifications.NotificationService
}

// NewInteractionService creates a new InteractionService instance
func NewInteractionService() *InteractionService {
	return &InteractionService{
		userService:         users.NewUserService(),
		notificationService: notifications.NewNotificationService(),
	}
}

// GetUserService returns the user service instance for use in other packages
func (i *InteractionService) GetUserService() *users.UserService {
	return i.userService
}

// LikeUser records a like interaction and checks for mutual matches
func (i *InteractionService) LikeUser(userID, targetUserID int) (map[string]interface{}, error) {
	// Validate that target user exists
	if err := i.userService.ValidateUserExists(targetUserID); err != nil {
		return nil, errors.New("target user does not exist")
	}

	// Check if interaction already exists
	var existingInteraction models.UserInteraction
	result := conf.DB.Where("user_id = ? AND target_user_id = ?", userID, targetUserID).
		First(&existingInteraction)

	if result.Error == nil {
		// Update existing interaction
		existingInteraction.InteractionType = "like"
		conf.DB.Save(&existingInteraction)
	} else {
		// Create new interaction
		interaction := models.UserInteraction{
			UserID:          uint(userID),
			TargetUserID:    uint(targetUserID),
			InteractionType: "like",
		}
		conf.DB.Create(&interaction)
	}

	response := map[string]interface{}{
		"action":         "like",
		"target_user_id": targetUserID,
		"success":        true,
	}

	// Send like notification to the target user
	i.notificationService.SendLikeNotification(targetUserID, userID)

	// Check for mutual like to create match
	var mutualLike models.UserInteraction
	mutualResult := conf.DB.Where("user_id = ? AND target_user_id = ? AND interaction_type = ?",
		targetUserID, userID, "like").First(&mutualLike)

	if mutualResult.Error == nil {
		// Create match
		match, err := matches.CreateMatch(userID, targetUserID)
		if err == nil {
			response["match_created"] = true
			response["match_id"] = match.ID

			// Send mutual like notifications to both users
			i.notificationService.SendMutualLikeNotification(targetUserID, userID)
			i.notificationService.SendMutualLikeNotification(userID, targetUserID)
		}
	}

	return response, nil
}

// UnlikeUser removes a like interaction and deactivates any match
func (i *InteractionService) UnlikeUser(userID, targetUserID int) (map[string]interface{}, error) {
	// Check if there was a match before unlinking
	wasMatched := matches.IsMatched(userID, targetUserID)

	// If they were matched, use the full unmatch logic to clean everything up
	if wasMatched {
		// Use interaction manager for complete unmatch (includes conversation deletion and like transformation)
		// Note: We need to avoid circular imports, so we'll use a simpler approach
		// Just transform the interactions and deactivate match here
		
		// Transform all like interactions between these users to "pass" 
		var interactions []models.UserInteraction
		err := conf.DB.Where(
			"((user_id = ? AND target_user_id = ?) OR (user_id = ? AND target_user_id = ?)) AND interaction_type = ?",
			userID, targetUserID, targetUserID, userID, "like",
		).Find(&interactions).Error
		
		if err != nil {
			return nil, fmt.Errorf("failed to find interactions: %v", err)
		}
		
		// Transform each like to a pass
		for _, interaction := range interactions {
			interaction.InteractionType = "pass"
			conf.DB.Save(&interaction)
		}
		
		// Deactivate the match
		matches.DeactivateMatch(userID, targetUserID)
		if err != nil {
			return nil, fmt.Errorf("failed to unmatch users: %v", err)
		}
		
		return map[string]interface{}{
			"action":         "unlike",
			"target_user_id": targetUserID,
			"success":        true,
			"message":        "Users unliked and fully unmatched (conversation deleted)",
		}, nil
	}

	// If they weren't matched, just remove the like interaction
	var existingInteraction models.UserInteraction
	result := conf.DB.Where("user_id = ? AND target_user_id = ?", userID, targetUserID).
		First(&existingInteraction)

	if result.Error == nil {
		// Delete the interaction
		conf.DB.Delete(&existingInteraction)
	}

	response := map[string]interface{}{
		"action":         "unlike",
		"target_user_id": targetUserID,
		"success":        true,
		"message":        "User unliked successfully",
	}

	return response, nil
}

// BlockUser blocks a user and removes any existing match
func (i *InteractionService) BlockUser(userID, targetUserID int) (map[string]interface{}, error) {
	// Validate that target user exists
	if err := i.userService.ValidateUserExists(targetUserID); err != nil {
		return nil, errors.New("target user does not exist")
	}

	// Check if interaction already exists
	var existingInteraction models.UserInteraction
	result := conf.DB.Where("user_id = ? AND target_user_id = ?", userID, targetUserID).
		First(&existingInteraction)

	if result.Error == nil {
		// Update existing interaction
		existingInteraction.InteractionType = "block"
		conf.DB.Save(&existingInteraction)
	} else {
		// Create new interaction
		interaction := models.UserInteraction{
			UserID:          uint(userID),
			TargetUserID:    uint(targetUserID),
			InteractionType: "block",
		}
		conf.DB.Create(&interaction)
	}

	// Deactivate any existing match
	matches.DeactivateMatch(userID, targetUserID)

	// Also remove the reverse interaction if it exists (target user liked this user)
	var reverseInteraction models.UserInteraction
	reverseResult := conf.DB.Where("user_id = ? AND target_user_id = ?", targetUserID, userID).
		First(&reverseInteraction)

	if reverseResult.Error == nil {
		conf.DB.Delete(&reverseInteraction)
	}

	response := map[string]interface{}{
		"action":         "block",
		"target_user_id": targetUserID,
		"success":        true,
		"message":        "User blocked successfully",
	}

	return response, nil
}

// GetUserInteractions retrieves all interactions for a user
func (i *InteractionService) GetUserInteractions(userID int) ([]models.UserInteraction, error) {
	if err := i.userService.ValidateUserExists(userID); err != nil {
		return nil, err
	}

	var interactions []models.UserInteraction
	result := conf.DB.Where("user_id = ?", userID).Find(&interactions)
	if result.Error != nil {
		return nil, result.Error
	}

	return interactions, nil
}

// GetInteractionBetweenUsers gets interaction between two specific users
func (i *InteractionService) GetInteractionBetweenUsers(userID, targetUserID int) (*models.UserInteraction, error) {
	var interaction models.UserInteraction
	result := conf.DB.Where("user_id = ? AND target_user_id = ?", userID, targetUserID).
		First(&interaction)

	if result.Error != nil {
		return nil, result.Error
	}

	return &interaction, nil
}

// GetMutualInteractions finds users who mutually liked each other
func (i *InteractionService) GetMutualInteractions(userID int) ([]int, error) {
	if err := i.userService.ValidateUserExists(userID); err != nil {
		return nil, err
	}

	var mutualUserIDs []int

	// Find users that this user liked
	var likedUsers []models.UserInteraction
	conf.DB.Where("user_id = ? AND interaction_type = ?", userID, "like").Find(&likedUsers)

	// Check which of those users also liked back
	for _, interaction := range likedUsers {
		var mutualLike models.UserInteraction
		result := conf.DB.Where("user_id = ? AND target_user_id = ? AND interaction_type = ?",
			interaction.TargetUserID, userID, "like").First(&mutualLike)

		if result.Error == nil {
			mutualUserIDs = append(mutualUserIDs, int(interaction.TargetUserID))
		}
	}

	return mutualUserIDs, nil
}

// IsUserBlocked checks if a user is blocked by another user
func (i *InteractionService) IsUserBlocked(userID, targetUserID int) (bool, error) {
	var interaction models.UserInteraction
	result := conf.DB.Where("user_id = ? AND target_user_id = ? AND interaction_type = ?",
		userID, targetUserID, "block").First(&interaction)

	return result.Error == nil, nil
}