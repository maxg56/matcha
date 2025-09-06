package services

import (
	"match-service/src/conf"
	"match-service/src/models"
)

type VectorMatchingService struct {
	learningRate     float64
	randomnessFactor float64
	maxDistanceKm    int
	maxAgeDifference int
}

func NewVectorMatchingService() *VectorMatchingService {
	return &VectorMatchingService{
		learningRate:     0.1,
		randomnessFactor: 0.15,
		maxDistanceKm:    50,
		maxAgeDifference: 10,
	}
}

func (v *VectorMatchingService) GetPotentialMatches(userID int, limit int, maxDistance *int, ageRange *AgeRange) ([]MatchResult, error) {
	// For now, fallback to basic matching algorithm
	// This is a simplified version - in production, you'd implement
	// the full vector matching algorithm from the Python version
	matchService := NewMatchService()
	return matchService.getBasicMatches(userID, limit, maxDistance, ageRange)
}

func (v *VectorMatchingService) RecordInteraction(userID, targetUserID int, action string) (map[string]interface{}, error) {
	// Record the interaction
	var existingInteraction models.UserInteraction
	result := conf.DB.Where("user_id = ? AND target_user_id = ?", userID, targetUserID).
		First(&existingInteraction)
	
	if result.Error == nil {
		existingInteraction.Action = action
		conf.DB.Save(&existingInteraction)
	} else {
		interaction := models.UserInteraction{
			UserID:       uint(userID),
			TargetUserID: uint(targetUserID),
			Action:       action,
		}
		conf.DB.Create(&interaction)
	}

	response := map[string]interface{}{
		"action":         action,
		"target_user_id": targetUserID,
		"success":        true,
	}

	// Handle like actions - check for mutual match
	if action == "like" {
		var mutualLike models.UserInteraction
		mutualResult := conf.DB.Where("user_id = ? AND target_user_id = ? AND action = ?", 
			targetUserID, userID, "like").First(&mutualLike)

		if mutualResult.Error == nil {
			// Create match
			match := models.Match{
				User1ID:  uint(userID),
				User2ID:  uint(targetUserID),
				IsActive: true,
			}
			
			// Ensure consistent ordering
			if userID > targetUserID {
				match.User1ID = uint(targetUserID)
				match.User2ID = uint(userID)
			}

			var existingMatch models.Match
			matchResult := conf.DB.Where("user1_id = ? AND user2_id = ?", 
				match.User1ID, match.User2ID).First(&existingMatch)
			
			if matchResult.Error != nil {
				conf.DB.Create(&match)
				response["match_created"] = true
				response["match_id"] = match.ID
			} else {
				existingMatch.IsActive = true
				conf.DB.Save(&existingMatch)
				response["match_created"] = true
				response["match_id"] = existingMatch.ID
			}
		}
	}

	return response, nil
}

func (v *VectorMatchingService) GetUserMatches(userID int) ([]MatchResult, error) {
	var matches []models.Match
	
	result := conf.DB.Where("(user1_id = ? OR user2_id = ?) AND is_active = ?", userID, userID, true).
		Preload("User1").Preload("User2").Find(&matches)
	
	if result.Error != nil {
		return nil, result.Error
	}

	var matchResults []MatchResult
	for _, match := range matches {
		var otherUser *models.User
		if match.User1ID == uint(userID) {
			otherUser = &match.User2
		} else {
			otherUser = &match.User1
		}

		if otherUser.ID == 0 {
			continue // Skip if no other user found
		}

		matchResults = append(matchResults, MatchResult{
			ID:            int(otherUser.ID),
			Username:      otherUser.Username,
			FirstName:     otherUser.FirstName,
			Age:           otherUser.Age,
			Bio:           otherUser.Bio,
			Fame:          otherUser.Fame,
			AlgorithmType: "vector_based",
		})
	}

	return matchResults, nil
}