package users

import (
	"match-service/src/conf"
	"match-service/src/models"
)

// ProfileTrackingService handles tracking of seen profiles
type ProfileTrackingService struct{}

// NewProfileTrackingService creates a new ProfileTrackingService instance
func NewProfileTrackingService() *ProfileTrackingService {
	return &ProfileTrackingService{}
}

// MarkProfilesAsSeen records that a user has seen specific profiles
func (s *ProfileTrackingService) MarkProfilesAsSeen(userID int, seenUserIDs []int, algorithmType string) error {
	for _, seenUserID := range seenUserIDs {
		seenProfile := models.UserSeenProfile{
			UserID:        uint(userID),
			SeenUserID:    uint(seenUserID),
			AlgorithmType: algorithmType,
		}

		// Use INSERT ON CONFLICT to avoid duplicates
		result := conf.DB.Exec(`
			INSERT INTO user_seen_profiles (user_id, seen_user_id, algorithm_type, seen_at)
			VALUES (?, ?, ?, CURRENT_TIMESTAMP)
			ON CONFLICT (user_id, seen_user_id) DO NOTHING`,
			seenProfile.UserID, seenProfile.SeenUserID, seenProfile.AlgorithmType)

		if result.Error != nil {
			return result.Error
		}
	}
	return nil
}

// MarkProfileAsSeen records that a user has seen a specific profile
func (s *ProfileTrackingService) MarkProfileAsSeen(userID int, seenUserID int, algorithmType string) error {
	return s.MarkProfilesAsSeen(userID, []int{seenUserID}, algorithmType)
}

// ResetSeenProfiles clears all seen profiles for a user (useful for development/testing)
func (s *ProfileTrackingService) ResetSeenProfiles(userID int) error {
	result := conf.DB.Where("user_id = ?", userID).Delete(&models.UserSeenProfile{})
	return result.Error
}

// GetSeenProfileIDs returns the list of profile IDs that a user has already seen
func (s *ProfileTrackingService) GetSeenProfileIDs(userID int) ([]uint, error) {
	var seenProfiles []models.UserSeenProfile
	err := conf.DB.Where("user_id = ?", userID).Find(&seenProfiles).Error
	if err != nil {
		return nil, err
	}

	var seenIDs []uint
	for _, profile := range seenProfiles {
		seenIDs = append(seenIDs, profile.SeenUserID)
	}
	return seenIDs, nil
}

// HasSeenProfile checks if a user has already seen a specific profile
func (s *ProfileTrackingService) HasSeenProfile(userID int, targetUserID int) (bool, error) {
	var count int64
	err := conf.DB.Model(&models.UserSeenProfile{}).
		Where("user_id = ? AND seen_user_id = ?", userID, targetUserID).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// GetSeenProfilesCount returns the total number of profiles a user has seen
func (s *ProfileTrackingService) GetSeenProfilesCount(userID int) (int64, error) {
	var count int64
	err := conf.DB.Model(&models.UserSeenProfile{}).
		Where("user_id = ?", userID).
		Count(&count).Error
	return count, err
}