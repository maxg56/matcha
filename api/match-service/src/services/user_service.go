package services

import (
	"errors"
	"math"
	"time"

	"match-service/src/conf"
	"match-service/src/models"
	"match-service/src/utils"
)

// UserService handles user-related operations for matching
type UserService struct{}

// NewUserService creates a new UserService instance
func NewUserService() *UserService {
	return &UserService{}
}

// ValidateUserExists checks if a user exists in the database
func (u *UserService) ValidateUserExists(userID int) error {
	var user models.User
	result := conf.DB.First(&user, userID)
	if result.Error != nil {
		return errors.New("user not found")
	}
	return nil
}

// GetUser retrieves a user by ID
func (u *UserService) GetUser(userID int) (*models.User, error) {
	var user models.User
	if err := conf.DB.First(&user, userID).Error; err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}

// GetUserVector converts a user to vector representation with caching
func (u *UserService) GetUserVector(userID int) (utils.UserVector, error) {
	// Check cache first
	if cached, exists := utils.GetCachedUserVector(userID); exists {
		return cached, nil
	}

	// Get user from database
	user, err := u.GetUser(userID)
	if err != nil {
		return utils.UserVector{}, err
	}

	// Convert to vector and cache
	vector := utils.UserToVector(user)
	utils.CacheUserVector(userID, vector, 10*time.Minute)

	return vector, nil
}

// GetCandidateUsers retrieves potential candidate users for matching
func (u *UserService) GetCandidateUsers(userID int, maxDistance *int, ageRange *AgeRange) ([]models.User, error) {
	// Get current user
	currentUser, err := u.GetUser(userID)
	if err != nil {
		return nil, err
	}

	query := conf.DB.Where("id != ?", userID)

	// Apply age range filter
	if ageRange != nil {
		query = query.Where("age BETWEEN ? AND ?", ageRange.Min, ageRange.Max)
	}

	// Apply gender preference filtering
	if currentUser.SexPref == "male" {
		query = query.Where("gender = ?", "male")
	} else if currentUser.SexPref == "female" {
		query = query.Where("gender = ?", "female")
	}

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
		var filteredCandidates []models.User
		for _, candidate := range candidates {
			if candidate.Latitude.Valid && candidate.Longitude.Valid {
				distance := utils.HaversineDistance(
					currentUser.Latitude.Float64, currentUser.Longitude.Float64,
					candidate.Latitude.Float64, candidate.Longitude.Float64,
				)
				if distance <= float64(*maxDistance) {
					filteredCandidates = append(filteredCandidates, candidate)
				}
			}
		}
		candidates = filteredCandidates
	}

	return candidates, nil
}

// GetUserMatches retrieves active matches for a user
func (u *UserService) GetUserMatches(userID int) ([]MatchResult, error) {
	var matches []models.Match
	
	// Get active matches where user is either user1 or user2
	result := conf.DB.Where("(user1_id = ? OR user2_id = ?) AND is_active = ?", userID, userID, true).
		Preload("User1").Preload("User2").Find(&matches)
	
	if result.Error != nil {
		return nil, result.Error
	}

	var matchResults []MatchResult
	for _, match := range matches {
		var matchedUser models.User
		
		// Determine which user is the matched user (not the current user)
		if match.User1ID == uint(userID) {
			matchedUser = match.User2
		} else {
			matchedUser = match.User1
		}

		matchResult := MatchResult{
			ID:        int(matchedUser.ID),
			Username:  matchedUser.Username,
			FirstName: matchedUser.FirstName,
			Age:       matchedUser.Age,
			Bio:       matchedUser.Bio,
			Fame:      matchedUser.Fame,
			AlgorithmType: "mutual_match",
		}

		matchResults = append(matchResults, matchResult)
	}

	return matchResults, nil
}