package matching

import (
	"math"
	"strings"

	"match-service/src/conf"
	"match-service/src/models"
	"match-service/src/utils"
	"match-service/src/services/types"
	"match-service/src/services/users"
	"match-service/src/services/preferences"
)

// UserMatchingService handles complex matching logic and candidate retrieval
type UserMatchingService struct {
	repository         *users.UserRepository
	preferencesManager *preferences.UserPreferencesManager
	trackingService    *users.ProfileTrackingService
}

// NewUserMatchingService creates a new UserMatchingService instance
func NewUserMatchingService() *UserMatchingService {
	return &UserMatchingService{
		repository:         users.NewUserRepository(),
		preferencesManager: preferences.NewUserPreferencesManager(),
		trackingService:    users.NewProfileTrackingService(),
	}
}

// GetCandidateUsers retrieves potential candidate users for matching with full preference filtering
func (s *UserMatchingService) GetCandidateUsers(userID int, maxDistance *int, ageRange *types.AgeRange) ([]models.User, error) {
	// Get current user
	currentUser, err := s.repository.GetUser(userID)
	if err != nil {
		return nil, err
	}

	// Get user preferences
	userPreferences, err := s.preferencesManager.GetUserMatchingPreferences(userID)
	if err != nil {
		return nil, err
	}

	query := conf.DB.Where("id != ?", userID)

	// Apply age range filter (use preferences if not overridden)
	if ageRange != nil {
		query = query.Where("age BETWEEN ? AND ?", ageRange.Min, ageRange.Max)
	}

	// Apply minimum fame filter from preferences
	if userPreferences.MinFame > 0 {
		query = query.Where("fame >= ?", userPreferences.MinFame)
	}

	// Apply gender preference filtering from preferences
	if userPreferences.PreferredGenders != "" && userPreferences.PreferredGenders != `["man","woman","other"]` {
		// Parse JSON array - for now, handle basic cases
		if strings.Contains(userPreferences.PreferredGenders, `"man"`) && !strings.Contains(userPreferences.PreferredGenders, `"woman"`) {
			query = query.Where("gender = ?", "man")
		} else if strings.Contains(userPreferences.PreferredGenders, `"woman"`) && !strings.Contains(userPreferences.PreferredGenders, `"man"`) {
			query = query.Where("gender = ?", "woman")
		}
		// If both or neither are present, don't filter by gender
	}

	// Exclude already seen profiles
	seenSubquery := conf.DB.Table("user_seen_profiles").
		Select("seen_user_id").
		Where("user_id = ?", userID)
	query = query.Where("id NOT IN (?)", seenSubquery)

	// Apply distance filter if specified
	if maxDistance != nil && currentUser.Latitude.Valid && currentUser.Longitude.Valid {
		// Use a simple bounding box for initial filtering (more efficient than Haversine in WHERE clause)
		latDelta := float64(*maxDistance) / 111.0 // Approximate km per degree of latitude
		lonDelta := latDelta / math.Cos(currentUser.Latitude.Float64*math.Pi/180)

		query = query.Where("latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?",
			currentUser.Latitude.Float64-latDelta, currentUser.Latitude.Float64+latDelta,
			currentUser.Longitude.Float64-lonDelta, currentUser.Longitude.Float64+lonDelta)
	}

	var candidates []models.User
	if err := query.Find(&candidates).Error; err != nil {
		return nil, err
	}

	// If distance filter is applied, do precise filtering
	if maxDistance != nil && currentUser.Latitude.Valid && currentUser.Longitude.Valid {
		candidates = s.filterByPreciseDistance(candidates, currentUser, *maxDistance)
	}

	return candidates, nil
}

// GetUserMatches retrieves active matches for a user
func (s *UserMatchingService) GetUserMatches(userID int) ([]types.MatchResult, error) {
	var matches []models.Match

	// Get active matches where user is either user1 or user2
	result := conf.DB.Where("(user1_id = ? OR user2_id = ?) AND is_active = ?", userID, userID, true).
		Preload("User1").Preload("User2").Find(&matches)

	if result.Error != nil {
		return nil, result.Error
	}

	var matchResults []types.MatchResult
	for _, match := range matches {
		var matchedUser models.User

		// Determine which user is the matched user (not the current user)
		if match.User1ID == uint(userID) {
			matchedUser = match.User2
		} else {
			matchedUser = match.User1
		}

		matchResult := types.MatchResult{
			ID:            int(matchedUser.ID),
			Username:      matchedUser.Username,
			FirstName:     matchedUser.FirstName,
			Age:           matchedUser.Age,
			Bio:           matchedUser.Bio,
			Fame:          matchedUser.Fame,
			AlgorithmType: "mutual_match",
		}

		matchResults = append(matchResults, matchResult)
	}

	return matchResults, nil
}


// filterByPreciseDistance filters candidates by precise distance calculation
func (s *UserMatchingService) filterByPreciseDistance(candidates []models.User, currentUser *models.User, maxDistance int) []models.User {
	var filteredCandidates []models.User
	for _, candidate := range candidates {
		if candidate.Latitude.Valid && candidate.Longitude.Valid {
			distance := utils.HaversineDistance(
				currentUser.Latitude.Float64, currentUser.Longitude.Float64,
				candidate.Latitude.Float64, candidate.Longitude.Float64,
			)
			if distance <= float64(maxDistance) {
				filteredCandidates = append(filteredCandidates, candidate)
			}
		}
	}
	return filteredCandidates
}