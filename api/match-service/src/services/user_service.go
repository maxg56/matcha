package services

import (
	"match-service/src/models"
	"match-service/src/utils"
)

// UserService handles user-related operations for matching
type UserService struct {
	repository      *UserRepository
	matchingService *UserMatchingService
	preferencesManager *UserPreferencesManager
	trackingService *ProfileTrackingService
}

// NewUserService creates a new UserService instance
func NewUserService() *UserService {
	return &UserService{
		repository:         NewUserRepository(),
		matchingService:    NewUserMatchingService(),
		preferencesManager: NewUserPreferencesManager(),
		trackingService:    NewProfileTrackingService(),
	}
}

// ValidateUserExists checks if a user exists in the database
func (u *UserService) ValidateUserExists(userID int) error {
	return u.repository.ValidateUserExists(userID)
}

// GetUser retrieves a user by ID
func (u *UserService) GetUser(userID int) (*models.User, error) {
	return u.repository.GetUser(userID)
}

// GetUserVector converts a user to vector representation with caching
func (u *UserService) GetUserVector(userID int) (utils.UserVector, error) {
	return u.repository.GetUserVector(userID)
}

// GetCandidateUsers retrieves potential candidate users for matching with full preference filtering
func (u *UserService) GetCandidateUsers(userID int, maxDistance *int, ageRange *AgeRange) ([]models.User, error) {
	return u.matchingService.GetCandidateUsers(userID, maxDistance, ageRange)
}

// GetUserMatches retrieves active matches for a user
func (u *UserService) GetUserMatches(userID int) ([]MatchResult, error) {
	return u.matchingService.GetUserMatches(userID)
}

// GetUserMatchingPreferences retrieves explicit matching preferences for a user
func (u *UserService) GetUserMatchingPreferences(userID int) (*models.UserMatchingPreferences, error) {
	return u.preferencesManager.GetUserMatchingPreferences(userID)
}

// MarkProfilesAsSeen records that a user has seen specific profiles
func (u *UserService) MarkProfilesAsSeen(userID int, seenUserIDs []int, algorithmType string) error {
	return u.trackingService.MarkProfilesAsSeen(userID, seenUserIDs, algorithmType)
}

// ResetSeenProfiles clears all seen profiles for a user (useful for development/testing)
func (u *UserService) ResetSeenProfiles(userID int) error {
	return u.trackingService.ResetSeenProfiles(userID)
}