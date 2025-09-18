package matches

import (
	"match-service/src/conf"
	"match-service/src/models"
)

// CreateMatch creates a new match between two users
func CreateMatch(userID, targetUserID int) (*models.Match, error) {
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

// DeactivateMatch deactivates a match between two users
func DeactivateMatch(userID, targetUserID int) error {
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