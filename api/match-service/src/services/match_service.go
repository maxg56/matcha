package services

import (
	"errors"
	"math"

	"match-service/src/conf"
	"match-service/src/models"
)

type MatchService struct{}

func NewMatchService() *MatchService {
	return &MatchService{}
}

// validateUserExists checks if a user exists in the database
func (s *MatchService) validateUserExists(userID int) error {
	var user models.User
	result := conf.DB.First(&user, userID)
	if result.Error != nil {
		return errors.New("user not found")
	}
	return nil
}

type MatchResult struct {
	ID               int     `json:"id"`
	Username         string  `json:"username"`
	FirstName        string  `json:"first_name"`
	Age              int     `json:"age"`
	Bio              string  `json:"bio"`
	Fame             int     `json:"fame"`
	AlgorithmType    string  `json:"algorithm_type"`
	CompatibilityScore *float64 `json:"compatibility_score,omitempty"`
	Distance         *float64 `json:"distance,omitempty"`
}

type AgeRange struct {
	Min int `json:"min"`
	Max int `json:"max"`
}

func (s *MatchService) GetUserMatches(userID int) ([]MatchResult, error) {
	var matches []models.Match
	
	// Get active matches where user is either user1 or user2
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

		matchResults = append(matchResults, MatchResult{
			ID:            int(otherUser.ID),
			Username:      otherUser.Username,
			FirstName:     otherUser.FirstName,
			Age:           otherUser.Age,
			Bio:           otherUser.Bio,
			Fame:          otherUser.Fame,
			AlgorithmType: "mutual_like",
		})
	}

	return matchResults, nil
}

func (s *MatchService) LikeUser(userID, targetUserID int) (map[string]interface{}, error) {
	// Validate that target user exists
	if err := s.validateUserExists(targetUserID); err != nil {
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

	// Check if target user also liked this user (mutual like)
	var mutualLike models.UserInteraction
	mutualResult := conf.DB.Where("user_id = ? AND target_user_id = ? AND interaction_type = ?", 
		targetUserID, userID, "like").First(&mutualLike)

	response := map[string]interface{}{
		"action":          "like",
		"target_user_id":  targetUserID,
		"match_created":   false,
	}

	if mutualResult.Error == nil {
		// Create match if mutual like exists
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
		matchResult := conf.DB.Where("user1_id = ? AND user2_id = ?", 
			match.User1ID, match.User2ID).First(&existingMatch)
		
		if matchResult.Error != nil {
			// Create new match
			conf.DB.Create(&match)
			response["match_created"] = true
			response["match_id"] = match.ID
		} else {
			// Reactivate existing match
			existingMatch.IsActive = true
			conf.DB.Save(&existingMatch)
			response["match_created"] = true
			response["match_id"] = existingMatch.ID
		}
	}

	return response, nil
}

func (s *MatchService) UnlikeUser(userID, targetUserID int) (map[string]interface{}, error) {
	// Validate that target user exists
	if err := s.validateUserExists(targetUserID); err != nil {
		return nil, errors.New("target user does not exist")
	}

	// Update or create interaction
	var existingInteraction models.UserInteraction
	result := conf.DB.Where("user_id = ? AND target_user_id = ?", userID, targetUserID).
		First(&existingInteraction)
	
	if result.Error == nil {
		existingInteraction.InteractionType = "pass"
		conf.DB.Save(&existingInteraction)
	} else {
		interaction := models.UserInteraction{
			UserID:          uint(userID),
			TargetUserID:    uint(targetUserID),
			InteractionType: "pass",
		}
		conf.DB.Create(&interaction)
	}

	return map[string]interface{}{
		"action":         "pass",
		"target_user_id": targetUserID,
	}, nil
}

func (s *MatchService) BlockUser(userID, targetUserID int) (map[string]interface{}, error) {
	// Validate that target user exists
	if err := s.validateUserExists(targetUserID); err != nil {
		return nil, errors.New("target user does not exist")
	}

	// Create block interaction
	var existingInteraction models.UserInteraction
	result := conf.DB.Where("user_id = ? AND target_user_id = ?", userID, targetUserID).
		First(&existingInteraction)
	
	if result.Error == nil {
		existingInteraction.InteractionType = "block"
		conf.DB.Save(&existingInteraction)
	} else {
		interaction := models.UserInteraction{
			UserID:          uint(userID),
			TargetUserID:    uint(targetUserID),
			InteractionType: "block",
		}
		conf.DB.Create(&interaction)
	}

	response := map[string]interface{}{
		"action":         "block",
		"target_user_id": targetUserID,
		"match_deactivated": false,
	}

	// Deactivate any existing match
	var match models.Match
	matchResult := conf.DB.Where(
		"((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)) AND is_active = ?",
		userID, targetUserID, targetUserID, userID, true).First(&match)

	if matchResult.Error == nil {
		match.IsActive = false
		conf.DB.Save(&match)
		response["match_deactivated"] = true
	}

	return response, nil
}

func (s *MatchService) RunMatchingAlgorithm(userID int, algorithmType string, limit int, maxDistance *int, ageRange *AgeRange) ([]MatchResult, error) {
	if algorithmType == "vector_based" {
		vectorService := NewVectorMatchingService()
		return vectorService.GetPotentialMatches(userID, limit, maxDistance, ageRange)
	}
	
	// Fallback to basic matching
	return s.getBasicMatches(userID, limit, maxDistance, ageRange)
}

func (s *MatchService) getBasicMatches(userID int, limit int, maxDistance *int, ageRange *AgeRange) ([]MatchResult, error) {
	// Get target user
	var targetUser models.User
	if err := conf.DB.First(&targetUser, userID).Error; err != nil {
		return nil, errors.New("user not found")
	}

	// Build query for compatible users
	query := conf.DB.Table("users").
		Where("id != ? AND latitude IS NOT NULL AND longitude IS NOT NULL", userID)

	// Apply compatibility filters based on sexual preferences
	if targetUser.SexPref == "both" {
		// Target likes everyone, find people who like target's gender or both
		query = query.Where("sex_pref = ? OR sex_pref = ?", targetUser.Gender, "both")
	} else {
		// Target likes specific gender, find people of that gender who like target's gender or both
		query = query.Where("gender = ? AND (sex_pref = ? OR sex_pref = ?)", 
			targetUser.SexPref, targetUser.Gender, "both")
	}

	// Apply distance filter if provided
	if maxDistance != nil && targetUser.Latitude.Valid && targetUser.Longitude.Valid {
		// Simple distance approximation (would need proper haversine in production)
		latRange := float64(*maxDistance) / 111.0 // Rough km to degree conversion
		lngRange := float64(*maxDistance) / (111.0 * math.Cos(targetUser.Latitude.Float64*math.Pi/180))
		
		query = query.Where("latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?",
			targetUser.Latitude.Float64-latRange, targetUser.Latitude.Float64+latRange,
			targetUser.Longitude.Float64-lngRange, targetUser.Longitude.Float64+lngRange)
	}

	// Apply age filter if provided
	if ageRange != nil {
		query = query.Where("age BETWEEN ? AND ?", ageRange.Min, ageRange.Max)
	}

	// Exclude users that have been blocked or passed
	query = query.Where(`id NOT IN (
		SELECT target_user_id FROM user_interactions 
		WHERE user_id = ? AND interaction_type IN ('block', 'pass')
	)`, userID)

	// Order by fame and limit results
	var users []models.User
	if err := query.Order("fame DESC, created_at DESC").Limit(limit).Find(&users).Error; err != nil {
		return nil, err
	}

	// Convert to MatchResult
	var matches []MatchResult
	for _, user := range users {
		var distance *float64
		if maxDistance != nil && targetUser.Latitude.Valid && targetUser.Longitude.Valid &&
			user.Latitude.Valid && user.Longitude.Valid {
			dist := haversineDistance(
				targetUser.Latitude.Float64, targetUser.Longitude.Float64,
				user.Latitude.Float64, user.Longitude.Float64,
			)
			distance = &dist
		}

		matches = append(matches, MatchResult{
			ID:            int(user.ID),
			Username:      user.Username,
			FirstName:     user.FirstName,
			Age:           user.Age,
			Bio:           user.Bio,
			Fame:          user.Fame,
			AlgorithmType: "basic",
			Distance:      distance,
		})
	}

	return matches, nil
}

// haversineDistance calculates the distance between two points on Earth
func haversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371 // Earth's radius in kilometers

	dLat := (lat2 - lat1) * (math.Pi / 180.0)
	dLon := (lon2 - lon1) * (math.Pi / 180.0)

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180.0)*math.Cos(lat2*math.Pi/180.0)*
			math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}