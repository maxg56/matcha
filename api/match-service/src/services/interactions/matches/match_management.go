package matches

import (
	"log"
	"time"

	"match-service/src/conf"
	"match-service/src/models"
)

// CreateMatch creates a new match between two users
func CreateMatch(userID, targetUserID int) (*models.Match, error) {
	log.Printf("🔍 [DEBUG CreateMatch] Creating match between users %d and %d", userID, targetUserID)

	match := models.Match{
		User1ID:   uint(userID),
		User2ID:   uint(targetUserID),
		IsActive:  true,
		MatchedAt: time.Now(),
	}

	// Ensure consistent ordering (smaller ID first)
	if userID > targetUserID {
		match.User1ID = uint(targetUserID)
		match.User2ID = uint(userID)
		log.Printf("🔍 [DEBUG CreateMatch] Reordered IDs: user1_id=%d, user2_id=%d", match.User1ID, match.User2ID)
	} else {
		log.Printf("🔍 [DEBUG CreateMatch] Using original order: user1_id=%d, user2_id=%d", match.User1ID, match.User2ID)
	}

	// Check if match already exists
	var existingMatch models.Match
	result := conf.DB.Where("user1_id = ? AND user2_id = ?",
		match.User1ID, match.User2ID).First(&existingMatch)

	if result.Error != nil {
		log.Printf("🔍 [DEBUG CreateMatch] No existing match found, creating new match")
		log.Printf("🔍 [DEBUG CreateMatch] Match object before create: %+v", match)

		// Create new match
		createResult := conf.DB.Create(&match)
		if createResult.Error != nil {
			log.Printf("❌ [ERROR CreateMatch] Failed to create new match: %v", createResult.Error)
			log.Printf("❌ [ERROR CreateMatch] RowsAffected: %d", createResult.RowsAffected)
			return nil, createResult.Error
		}

		log.Printf("✅ [SUCCESS CreateMatch] New match created with ID: %d, RowsAffected: %d", match.ID, createResult.RowsAffected)
		log.Printf("🔍 [DEBUG CreateMatch] Match object after create: %+v", match)

		// Verify the match was actually saved
		var verifyMatch models.Match
		verifyResult := conf.DB.Where("user1_id = ? AND user2_id = ?", match.User1ID, match.User2ID).First(&verifyMatch)
		if verifyResult.Error != nil {
			log.Printf("❌ [ERROR CreateMatch] Could not verify match creation: %v", verifyResult.Error)
		} else {
			log.Printf("✅ [SUCCESS CreateMatch] Verified match exists in DB: ID=%d, User1=%d, User2=%d, Active=%t",
				verifyMatch.ID, verifyMatch.User1ID, verifyMatch.User2ID, verifyMatch.IsActive)
		}

		return &match, nil
	} else {
		log.Printf("🔍 [DEBUG CreateMatch] Existing match found (ID: %d), reactivating", existingMatch.ID)
		log.Printf("🔍 [DEBUG CreateMatch] Existing match before save: %+v", existingMatch)

		// Reactivate existing match
		existingMatch.IsActive = true
		saveResult := conf.DB.Save(&existingMatch)
		if saveResult.Error != nil {
			log.Printf("❌ [ERROR CreateMatch] Failed to reactivate existing match: %v", saveResult.Error)
			log.Printf("❌ [ERROR CreateMatch] RowsAffected: %d", saveResult.RowsAffected)
			return nil, saveResult.Error
		}

		log.Printf("✅ [SUCCESS CreateMatch] Existing match reactivated (ID: %d), RowsAffected: %d", existingMatch.ID, saveResult.RowsAffected)
		log.Printf("🔍 [DEBUG CreateMatch] Existing match after save: %+v", existingMatch)
		return &existingMatch, nil
	}
}

// DeactivateMatch deactivates a match between two users
func DeactivateMatch(userID, targetUserID int) error {
	log.Printf("🔍 [DEBUG DeactivateMatch] Deactivating match between users %d and %d", userID, targetUserID)

	// Determine correct ordering
	user1ID, user2ID := userID, targetUserID
	if userID > targetUserID {
		user1ID, user2ID = targetUserID, userID
		log.Printf("🔍 [DEBUG DeactivateMatch] Reordered IDs: user1_id=%d, user2_id=%d", user1ID, user2ID)
	} else {
		log.Printf("🔍 [DEBUG DeactivateMatch] Using original order: user1_id=%d, user2_id=%d", user1ID, user2ID)
	}

	var match models.Match
	result := conf.DB.Where("user1_id = ? AND user2_id = ? AND is_active = ?", user1ID, user2ID, true).First(&match)

	if result.Error != nil {
		if result.Error.Error() == "record not found" {
			log.Printf("⚠️ [WARNING DeactivateMatch] No active match found between users %d and %d", userID, targetUserID)
			return nil // Not an error - match might already be deactivated or never existed
		}
		log.Printf("❌ [ERROR DeactivateMatch] Failed to find match: %v", result.Error)
		return result.Error
	}

	log.Printf("🔍 [DEBUG DeactivateMatch] Found active match (ID: %d), deactivating", match.ID)
	log.Printf("🔍 [DEBUG DeactivateMatch] Match before deactivation: %+v", match)

	match.IsActive = false
	saveResult := conf.DB.Save(&match)
	if saveResult.Error != nil {
		log.Printf("❌ [ERROR DeactivateMatch] Failed to deactivate match: %v", saveResult.Error)
		log.Printf("❌ [ERROR DeactivateMatch] RowsAffected: %d", saveResult.RowsAffected)
		return saveResult.Error
	}

	log.Printf("✅ [SUCCESS DeactivateMatch] Match deactivated (ID: %d), RowsAffected: %d", match.ID, saveResult.RowsAffected)
	log.Printf("🔍 [DEBUG DeactivateMatch] Match after deactivation: %+v", match)

	return nil
}