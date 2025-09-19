package basic

import (
	"errors"
	"math"

	"match-service/src/conf"
	"match-service/src/models"
	"match-service/src/utils"
	"match-service/src/services/types"
	"match-service/src/services/users"
)

// BasicMatchingService provides simple compatibility-based matching
type BasicMatchingService struct {
	userService *users.UserService
}

// NewBasicMatchingService creates a new BasicMatchingService instance
func NewBasicMatchingService() *BasicMatchingService {
	return &BasicMatchingService{
		userService: users.NewUserService(),
	}
}

// GetMatches returns basic matches for a user based on sexual preferences and filters
func (b *BasicMatchingService) GetMatches(userID int, limit int, maxDistance *int, ageRange *types.AgeRange) ([]types.MatchResult, error) {
	// Get target user
	targetUser, err := b.userService.GetUser(userID)
	if err != nil {
		return nil, err
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
		// Simple distance approximation using bounding box
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

	// Order by fame (descending) and limit results
	query = query.Order("fame DESC").Limit(limit)

	var users []models.User
	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}

	// Convert to types.MatchResult format with distance calculation
	var results []types.MatchResult
	for _, user := range users {
		var distance *float64
		if targetUser.Latitude.Valid && targetUser.Longitude.Valid && 
		   user.Latitude.Valid && user.Longitude.Valid {
			dist := utils.HaversineDistance(
				targetUser.Latitude.Float64, targetUser.Longitude.Float64,
				user.Latitude.Float64, user.Longitude.Float64,
			)
			distance = &dist
		}

		result := types.MatchResult{
			ID:            int(user.ID),
			Username:      user.Username,
			FirstName:     user.FirstName,
			Age:           user.Age,
			Bio:           user.Bio,
			Fame:          user.Fame,
			AlgorithmType: "basic_compatibility",
			Distance:      distance,
		}
		results = append(results, result)
	}

	return results, nil
}

// GetNearbyUsers returns users within a specified distance, regardless of compatibility
func (b *BasicMatchingService) GetNearbyUsers(userID int, maxDistanceKm int, limit int) ([]types.MatchResult, error) {
	targetUser, err := b.userService.GetUser(userID)
	if err != nil {
		return nil, err
	}

	if !targetUser.Latitude.Valid || !targetUser.Longitude.Valid {
		return nil, errors.New("user location not available")
	}

	// Simple bounding box query for efficiency
	latRange := float64(maxDistanceKm) / 111.0
	lngRange := latRange / math.Cos(targetUser.Latitude.Float64*math.Pi/180)

	query := conf.DB.Where("id != ? AND latitude IS NOT NULL AND longitude IS NOT NULL", userID).
		Where("latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?",
			targetUser.Latitude.Float64-latRange, targetUser.Latitude.Float64+latRange,
			targetUser.Longitude.Float64-lngRange, targetUser.Longitude.Float64+lngRange).
		Limit(limit)

	var users []models.User
	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}

	// Filter by precise distance and convert to results
	var results []types.MatchResult
	for _, user := range users {
		if user.Latitude.Valid && user.Longitude.Valid {
			distance := utils.HaversineDistance(
				targetUser.Latitude.Float64, targetUser.Longitude.Float64,
				user.Latitude.Float64, user.Longitude.Float64,
			)
			
			if distance <= float64(maxDistanceKm) {
				result := types.MatchResult{
					ID:            int(user.ID),
					Username:      user.Username,
					FirstName:     user.FirstName,
					Age:           user.Age,
					Bio:           user.Bio,
					Fame:          user.Fame,
					AlgorithmType: "proximity",
					Distance:      &distance,
				}
				results = append(results, result)
			}
		}
	}

	return results, nil
}

// GetRandomMatches returns random users that meet basic compatibility criteria
func (b *BasicMatchingService) GetRandomMatches(userID int, limit int) ([]types.MatchResult, error) {
	targetUser, err := b.userService.GetUser(userID)
	if err != nil {
		return nil, err
	}

	// Build basic compatibility query
	query := conf.DB.Table("users").Where("id != ?", userID)

	// Apply sexual preference filtering
	if targetUser.SexPref == "both" {
		query = query.Where("sex_pref = ? OR sex_pref = ?", targetUser.Gender, "both")
	} else {
		query = query.Where("gender = ? AND (sex_pref = ? OR sex_pref = ?)", 
			targetUser.SexPref, targetUser.Gender, "both")
	}

	// Order randomly and limit
	query = query.Order("RANDOM()").Limit(limit)

	var users []models.User
	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}

	// Convert to results
	var results []types.MatchResult
	for _, user := range users {
		result := types.MatchResult{
			ID:            int(user.ID),
			Username:      user.Username,
			FirstName:     user.FirstName,
			Age:           user.Age,
			Bio:           user.Bio,
			Fame:          user.Fame,
			AlgorithmType: "random",
		}
		results = append(results, result)
	}

	return results, nil
}

// GetNewUsers returns recently joined users that match basic criteria
func (b *BasicMatchingService) GetNewUsers(userID int, limit int, daysBack int) ([]types.MatchResult, error) {
	targetUser, err := b.userService.GetUser(userID)
	if err != nil {
		return nil, err
	}

	// Build query for new users
	query := conf.DB.Table("users").
		Where("id != ? AND created_at >= NOW() - INTERVAL ? DAY", userID, daysBack)

	// Apply sexual preference filtering
	if targetUser.SexPref == "both" {
		query = query.Where("sex_pref = ? OR sex_pref = ?", targetUser.Gender, "both")
	} else {
		query = query.Where("gender = ? AND (sex_pref = ? OR sex_pref = ?)", 
			targetUser.SexPref, targetUser.Gender, "both")
	}

	// Order by registration date (newest first) and limit
	query = query.Order("created_at DESC").Limit(limit)

	var users []models.User
	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}

	// Convert to results
	var results []types.MatchResult
	for _, user := range users {
		result := types.MatchResult{
			ID:            int(user.ID),
			Username:      user.Username,
			FirstName:     user.FirstName,
			Age:           user.Age,
			Bio:           user.Bio,
			Fame:          user.Fame,
			AlgorithmType: "new_users",
		}
		results = append(results, result)
	}

	return results, nil
}

// GetPopularUsers returns users with highest fame ratings that match basic criteria
func (b *BasicMatchingService) GetPopularUsers(userID int, limit int, minFame int) ([]types.MatchResult, error) {
	targetUser, err := b.userService.GetUser(userID)
	if err != nil {
		return nil, err
	}

	// Build query for popular users
	query := conf.DB.Table("users").
		Where("id != ? AND fame >= ?", userID, minFame)

	// Apply sexual preference filtering
	if targetUser.SexPref == "both" {
		query = query.Where("sex_pref = ? OR sex_pref = ?", targetUser.Gender, "both")
	} else {
		query = query.Where("gender = ? AND (sex_pref = ? OR sex_pref = ?)", 
			targetUser.SexPref, targetUser.Gender, "both")
	}

	// Order by fame (descending) and limit
	query = query.Order("fame DESC").Limit(limit)

	var users []models.User
	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}

	// Convert to results
	var results []types.MatchResult
	for _, user := range users {
		result := types.MatchResult{
			ID:            int(user.ID),
			Username:      user.Username,
			FirstName:     user.FirstName,
			Age:           user.Age,
			Bio:           user.Bio,
			Fame:          user.Fame,
			AlgorithmType: "popular",
		}
		results = append(results, result)
	}

	return results, nil
}