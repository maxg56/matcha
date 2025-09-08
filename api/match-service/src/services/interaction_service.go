package services

import (
	"errors"

	"match-service/src/conf"
	"match-service/src/models"
)

// InteractionService handles user interactions (likes, unlikes, blocks)
type InteractionService struct {
	userService *UserService
}

// NewInteractionService creates a new InteractionService instance
func NewInteractionService() *InteractionService {
	return &InteractionService{
		userService: NewUserService(),
	}
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

	// Check for mutual like to create match
	var mutualLike models.UserInteraction
	mutualResult := conf.DB.Where("user_id = ? AND target_user_id = ? AND interaction_type = ?", 
		targetUserID, userID, "like").First(&mutualLike)

	if mutualResult.Error == nil {
		// Create match
		match, err := i.createMatch(userID, targetUserID)
		if err == nil {
			response["match_created"] = true
			response["match_id"] = match.ID
		}
	}

	return response, nil
}

// UnlikeUser removes a like interaction and deactivates any match
func (i *InteractionService) UnlikeUser(userID, targetUserID int) (map[string]interface{}, error) {
	// Remove or update the interaction
	var existingInteraction models.UserInteraction
	result := conf.DB.Where("user_id = ? AND target_user_id = ?", userID, targetUserID).
		First(&existingInteraction)
	
	if result.Error == nil {
		// Delete the interaction
		conf.DB.Delete(&existingInteraction)
	}

	// Deactivate any existing match
	i.deactivateMatch(userID, targetUserID)

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
	i.deactivateMatch(userID, targetUserID)

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

// createMatch creates a new match between two users
func (i *InteractionService) createMatch(userID, targetUserID int) (*models.Match, error) {
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
func (i *InteractionService) deactivateMatch(userID, targetUserID int) error {
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