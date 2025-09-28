package core

import (
	"errors"
	"log"
	"strconv"
	"time"

	"match-service/src/conf"
	"match-service/src/models"
	"match-service/src/services/types"
	"match-service/src/services/users"
	"match-service/src/services/interactions/matches"
)

// InteractionService handles user interactions (likes, unlikes, blocks)
type InteractionService struct {
	userService *users.UserService
}

// NewInteractionService creates a new InteractionService instance
func NewInteractionService() *InteractionService {
	return &InteractionService{
		userService: users.NewUserService(),
	}
}

// GetUserService returns the user service instance for use in other packages
func (i *InteractionService) GetUserService() *users.UserService {
	return i.userService
}

// LikeUser records a like interaction and checks for mutual matches
func (i *InteractionService) LikeUser(userID, targetUserID int) (map[string]interface{}, error) {
	log.Printf("🔍 [DEBUG Like] User %d is liking user %d", userID, targetUserID)

	// Validate that target user exists
	if err := i.userService.ValidateUserExists(targetUserID); err != nil {
		log.Printf("❌ [ERROR Like] Target user %d does not exist", targetUserID)
		return nil, errors.New("target user does not exist")
	}

	// Check if interaction already exists
	var existingInteraction models.UserInteraction
	result := conf.DB.Where("user_id = ? AND target_user_id = ?", userID, targetUserID).
		First(&existingInteraction)

	if result.Error == nil {
		// Update existing interaction
		log.Printf("🔍 [DEBUG Like] Updating existing interaction ID %d to 'like'", existingInteraction.ID)
		existingInteraction.InteractionType = "like"
		conf.DB.Save(&existingInteraction)
	} else {
		// Create new interaction
		log.Printf("🔍 [DEBUG Like] Creating new like interaction")
		interaction := models.UserInteraction{
			UserID:          uint(userID),
			TargetUserID:    uint(targetUserID),
			InteractionType: "like",
		}
		if err := conf.DB.Create(&interaction).Error; err != nil {
			log.Printf("❌ [ERROR Like] Failed to create interaction: %v", err)
		} else {
			log.Printf("✅ [SUCCESS Like] Created interaction with ID %d", interaction.ID)
		}
	}

	response := map[string]interface{}{
		"action":         "like",
		"target_user_id": targetUserID,
		"success":        true,
	}

	// Check for mutual like to create match
	log.Printf("🔍 [DEBUG Like] Checking for mutual like: looking for user %d -> user %d", targetUserID, userID)
	var mutualLike models.UserInteraction
	mutualResult := conf.DB.Where("user_id = ? AND target_user_id = ? AND interaction_type = ?",
		targetUserID, userID, "like").First(&mutualLike)

	if mutualResult.Error == nil {
		log.Printf("✅ [DEBUG Like] Mutual like found! Creating match between users %d and %d", userID, targetUserID)
		// Create match
		match, err := matches.CreateMatch(userID, targetUserID)
		if err == nil {
			response["match_created"] = true
			response["match_id"] = match.ID
			log.Printf("✅ [SUCCESS Match] Match created with ID %d", match.ID)
		} else {
			log.Printf("❌ [ERROR Match] Failed to create match: %v", err)
		}
	} else {
		log.Printf("🔍 [DEBUG Like] No mutual like found. User %d has not liked user %d yet. Error: %v", targetUserID, userID, mutualResult.Error)
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
	matches.DeactivateMatch(userID, targetUserID)

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

// GetReceivedLikes returns all likes received by a user (Premium feature)
func (i *InteractionService) GetReceivedLikes(userID int) ([]types.ReceivedLike, error) {
	if err := i.userService.ValidateUserExists(userID); err != nil {
		return nil, err
	}

	var interactions []models.UserInteraction
	if err := conf.DB.Where("target_user_id = ? AND interaction_type = ?", userID, "like").
		Order("created_at DESC").Find(&interactions).Error; err != nil {
		return nil, err
	}

	var receivedLikes []types.ReceivedLike
	for _, interaction := range interactions {
		// Get user profile for each like
		user, err := i.userService.GetUser(int(interaction.UserID))
		if err != nil {
			continue // Skip if user doesn't exist anymore
		}

		// Convert user to MatchResult
		userProfile := convertUserToMatchResult(user)

		// Check if it's mutual
		isMutual := i.checkIsMutual(int(interaction.UserID), userID)

		like := types.ReceivedLike{
			ID:           int(interaction.ID),
			UserID:       int(interaction.UserID),
			TargetUserID: int(interaction.TargetUserID),
			UserProfile:  userProfile,
			CreatedAt:    interaction.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			IsMutual:     isMutual,
		}
		receivedLikes = append(receivedLikes, like)
	}

	return receivedLikes, nil
}

// GetReceivedLikesPreview returns limited preview of received likes for free users
func (i *InteractionService) GetReceivedLikesPreview(userID int, limit int) ([]types.ReceivedLikePreview, error) {
	if err := i.userService.ValidateUserExists(userID); err != nil {
		return nil, err
	}

	var interactions []models.UserInteraction
	if err := conf.DB.Where("target_user_id = ? AND interaction_type = ?", userID, "like").
		Order("created_at DESC").Limit(limit).Find(&interactions).Error; err != nil {
		return nil, err
	}

	var previewLikes []types.ReceivedLikePreview
	for _, interaction := range interactions {
		// Create blurred data for free users
		preview := types.ReceivedLikePreview{
			ID:                strconv.FormatUint(uint64(interaction.ID), 10), // Convert uint to string
			CreatedAt:         interaction.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			BlurredImage:      generateBlurredImageURL(int(interaction.UserID)), // Placeholder
			TimestampRelative: formatRelativeTime(interaction.CreatedAt),
		}
		previewLikes = append(previewLikes, preview)
	}

	return previewLikes, nil
}

// GetLikeStats returns statistics about likes received by the user
func (i *InteractionService) GetLikeStats(userID int) (*types.LikeStats, error) {
	if err := i.userService.ValidateUserExists(userID); err != nil {
		return nil, err
	}

	stats := &types.LikeStats{
		LikeRateTrend: "stable", // Default
	}

	// Count total likes received
	var totalLikes int64
	conf.DB.Model(&models.UserInteraction{}).
		Where("target_user_id = ? AND interaction_type = ?", userID, "like").
		Count(&totalLikes)
	stats.TotalLikesReceived = int(totalLikes)

	// Count likes today (simplified - using last 24 hours)
	var likesToday int64
	conf.DB.Model(&models.UserInteraction{}).
		Where("target_user_id = ? AND interaction_type = ? AND created_at > NOW() - INTERVAL '1 day'",
			userID, "like").
		Count(&likesToday)
	stats.LikesToday = int(likesToday)

	// Count likes this week
	var likesWeek int64
	conf.DB.Model(&models.UserInteraction{}).
		Where("target_user_id = ? AND interaction_type = ? AND created_at > NOW() - INTERVAL '7 days'",
			userID, "like").
		Count(&likesWeek)
	stats.LikesThisWeek = int(likesWeek)

	// Count likes this month
	var likesMonth int64
	conf.DB.Model(&models.UserInteraction{}).
		Where("target_user_id = ? AND interaction_type = ? AND created_at > NOW() - INTERVAL '30 days'",
			userID, "like").
		Count(&likesMonth)
	stats.LikesThisMonth = int(likesMonth)

	// Calculate average per day (simplified)
	if totalLikes > 0 {
		stats.AverageLikesPerDay = float64(totalLikes) / 30.0 // Rough approximation
	}

	return stats, nil
}

// Helper function to check if interaction is mutual
func (i *InteractionService) checkIsMutual(userID, targetUserID int) bool {
	var interaction models.UserInteraction
	result := conf.DB.Where("user_id = ? AND target_user_id = ? AND interaction_type = ?",
		targetUserID, userID, "like").First(&interaction)
	return result.Error == nil
}

// Helper functions (simplified implementations)
func generateBlurredImageURL(userID int) string {
	// This would generate a blurred placeholder image URL
	return "https://via.placeholder.com/400x600/CCCCCC/FFFFFF?text=Like"
}

// convertUserToMatchResult converts a models.User to a MatchResult
func convertUserToMatchResult(user *models.User) types.MatchResult {
	// Calculate age from birth_date (simplified)
	age := calculateAge(user.BirthDate)

	return types.MatchResult{
		ID:        int(user.ID),
		Username:  user.Username,
		FirstName: user.FirstName,
		Age:       age,
		Bio:       user.Bio,
		Fame:      user.Fame,
		// Note: autres champs pourraient être ajoutés si nécessaire
	}
}

// calculateAge calculates age from birth date
func calculateAge(birthDate time.Time) int {
	now := time.Now()
	years := now.Year() - birthDate.Year()

	// Ajuster si l'anniversaire n'est pas encore passé cette année
	if now.YearDay() < birthDate.YearDay() {
		years--
	}

	return years
}

func formatRelativeTime(t time.Time) string {
	now := time.Now()
	duration := now.Sub(t)

	if duration < time.Hour {
		minutes := int(duration.Minutes())
		if minutes < 1 {
			return "À l'instant"
		}
		return "Il y a " + strconv.Itoa(minutes) + " min"
	} else if duration < 24*time.Hour {
		hours := int(duration.Hours())
		return "Il y a " + strconv.Itoa(hours) + "h"
	} else if duration < 7*24*time.Hour {
		days := int(duration.Hours() / 24)
		return "Il y a " + strconv.Itoa(days) + " jour(s)"
	} else {
		return t.Format("02/01/2006")
	}
}