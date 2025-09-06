package services

import (
	"errors"
	"log"
	"math"
	"math/rand"
	"sort"
	"time"

	"match-service/src/conf"
	"match-service/src/models"
	"match-service/src/utils"
)

type VectorMatchingService struct {
	learningRate     float64
	randomnessFactor float64
	maxDistanceKm    int
	maxAgeDifference int
	weights          map[string]float64
}

func NewVectorMatchingService() *VectorMatchingService {
	// Define default weights for attributes
	weights := map[string]float64{
		"age":                   0.15,
		"height":                0.05,
		"fame":                  0.10,
		"alcohol_consumption":   0.08,
		"smoking":               0.12,
		"cannabis":              0.06,
		"drugs":                 0.10,
		"pets":                  0.07,
		"social_activity_level": 0.08,
		"sport_activity":        0.08,
		"education_level":       0.06,
		"religion":              0.05,
		"children_status":       0.05,
		"political_view":        0.05,
	}

	return &VectorMatchingService{
		learningRate:     0.1,
		randomnessFactor: 0.15,
		maxDistanceKm:    50,
		maxAgeDifference: 10,
		weights:          weights,
	}
}

func (v *VectorMatchingService) GetPotentialMatches(userID int, limit int, maxDistance *int, ageRange *AgeRange) ([]MatchResult, error) {
	// Check cache first
	cacheKey := utils.AlgorithmResultsCacheKey(userID, "enhanced_vector", limit, maxDistance)
	if cached, exists := utils.CompatibilityCache.Get(cacheKey); exists {
		if results, ok := cached.([]MatchResult); ok {
			log.Printf("Cache hit for user %d matches", userID)
			return results, nil
		}
	}

	// Get current user
	var currentUser models.User
	if err := conf.DB.First(&currentUser, userID).Error; err != nil {
		return nil, errors.New("user not found")
	}

	// Convert user to vector (check cache first)
	var currentUserVector utils.UserVector
	if cached, exists := utils.GetCachedUserVector(userID); exists {
		currentUserVector = cached
		log.Printf("Cache hit for user %d vector", userID)
	} else {
		currentUserVector = utils.UserToVector(&currentUser)
		utils.CacheUserVector(userID, currentUserVector, 10*time.Minute)
	}

	// Get or create user preference vector
	preferenceVector, err := v.getUserPreferenceVector(uint(userID), currentUserVector)
	if err != nil {
		log.Printf("Error getting preference vector: %v", err)
		preferenceVector = currentUserVector // fallback to user's own vector
	}

	// Get potential candidates
	candidates, err := v.getCandidateUsers(userID, maxDistance, ageRange)
	if err != nil {
		return nil, err
	}

	// Calculate compatibility scores
	var scores []utils.CompatibilityScore
	for _, candidate := range candidates {
		candidateVector := utils.UserToVector(&candidate)
		score := v.calculateCompatibilityScore(preferenceVector, candidateVector, &currentUser, &candidate)
		scores = append(scores, score)
	}

	// Sort by compatibility score (descending)
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].CompatibilityScore > scores[j].CompatibilityScore
	})

	// Convert to MatchResult and apply limit
	var results []MatchResult
	maxResults := limit
	if maxResults > len(scores) {
		maxResults = len(scores)
	}

	for i := 0; i < maxResults; i++ {
		score := scores[i]
		var user models.User
		if err := conf.DB.First(&user, score.UserID).Error; err != nil {
			continue
		}

		compatScore := score.CompatibilityScore
		distance := score.Distance

		result := MatchResult{
			ID:                 int(user.ID),
			Username:           user.Username,
			FirstName:          user.FirstName,
			Age:                user.Age,
			Bio:                user.Bio,
			Fame:               user.Fame,
			AlgorithmType:      "enhanced_vector",
			CompatibilityScore: &compatScore,
			Distance:           &distance,
		}
		results = append(results, result)
	}

	// Cache the results for 5 minutes
	utils.CompatibilityCache.Set(cacheKey, results, 5*time.Minute)

	return results, nil
}

// getUserPreferenceVector gets or creates a preference vector for a user
func (v *VectorMatchingService) getUserPreferenceVector(userID uint, defaultVector utils.UserVector) (utils.UserVector, error) {
	var preference models.UserPreference
	result := conf.DB.Where("user_id = ?", userID).First(&preference)
	
	if result.Error != nil {
		// Create default preference vector based on user's own attributes
		preference = models.UserPreference{
			UserID:              userID,
			Age:                 defaultVector.Age,
			Height:              defaultVector.Height,
			Fame:                defaultVector.Fame,
			AlcoholConsumption:  defaultVector.AlcoholConsumption,
			Smoking:             defaultVector.Smoking,
			Cannabis:            defaultVector.Cannabis,
			Drugs:               defaultVector.Drugs,
			Pets:                defaultVector.Pets,
			SocialActivityLevel: defaultVector.SocialActivityLevel,
			SportActivity:       defaultVector.SportActivity,
			EducationLevel:      defaultVector.EducationLevel,
			Religion:            defaultVector.Religion,
			ChildrenStatus:      defaultVector.ChildrenStatus,
			PoliticalView:       defaultVector.PoliticalView,
			Latitude:            defaultVector.Latitude,
			Longitude:           defaultVector.Longitude,
			UpdateCount:         0,
		}
		conf.DB.Create(&preference)
	}

	return utils.UserVector{
		UserID:              preference.UserID,
		Age:                 preference.Age,
		Height:              preference.Height,
		Fame:                preference.Fame,
		AlcoholConsumption:  preference.AlcoholConsumption,
		Smoking:             preference.Smoking,
		Cannabis:            preference.Cannabis,
		Drugs:               preference.Drugs,
		Pets:                preference.Pets,
		SocialActivityLevel: preference.SocialActivityLevel,
		SportActivity:       preference.SportActivity,
		EducationLevel:      preference.EducationLevel,
		Religion:            preference.Religion,
		ChildrenStatus:      preference.ChildrenStatus,
		PoliticalView:       preference.PoliticalView,
		Latitude:            preference.Latitude,
		Longitude:           preference.Longitude,
	}, nil
}

// getCandidateUsers gets potential match candidates with optimized filters
func (v *VectorMatchingService) getCandidateUsers(userID int, maxDistance *int, ageRange *AgeRange) ([]models.User, error) {
	var users []models.User

	// Build optimized query with proper joins for exclusions
	query := conf.DB.Table("users").
		Select("users.*").
		Where("users.id != ?", userID).
		Where("users.latitude IS NOT NULL AND users.longitude IS NOT NULL") // Only users with location

	// Apply age range filter
	if ageRange != nil {
		query = query.Where("users.age BETWEEN ? AND ?", ageRange.Min, ageRange.Max)
	}

	// Exclude blocked users more efficiently with LEFT JOINs
	query = query.
		Where("users.id NOT IN (SELECT ui1.target_user_id FROM user_interactions ui1 WHERE ui1.user_id = ? AND ui1.interaction_type = 'block')", userID).
		Where("users.id NOT IN (SELECT ui2.user_id FROM user_interactions ui2 WHERE ui2.target_user_id = ? AND ui2.interaction_type = 'block')", userID)

	// Order by fame and recent activity for better candidates first
	query = query.Order("users.fame DESC, users.updated_at DESC")

	// Limit initial candidates to avoid processing too many users
	query = query.Limit(500) // Reasonable limit for large user bases

	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}

	// Apply distance filter if specified
	if maxDistance != nil {
		var currentUser models.User
		if err := conf.DB.Select("latitude, longitude").First(&currentUser, userID).Error; err != nil {
			return nil, err
		}

		if currentUser.Latitude.Valid && currentUser.Longitude.Valid {
			var filteredUsers []models.User
			for _, user := range users {
				if user.Latitude.Valid && user.Longitude.Valid {
					distance := utils.HaversineDistance(
						currentUser.Latitude.Float64,
						currentUser.Longitude.Float64,
						user.Latitude.Float64,
						user.Longitude.Float64,
					)
					if distance <= float64(*maxDistance) {
						filteredUsers = append(filteredUsers, user)
					}
				}
			}
			users = filteredUsers
		}
	}

	log.Printf("Found %d candidate users for user %d", len(users), userID)
	return users, nil
}

// calculateCompatibilityScore calculates enhanced compatibility score with caching
func (v *VectorMatchingService) calculateCompatibilityScore(preferenceVector, candidateVector utils.UserVector, currentUser, candidate *models.User) utils.CompatibilityScore {
	// Check cache first
	if cached, exists := utils.GetCachedCompatibilityScore(int(currentUser.ID), int(candidate.ID)); exists {
		return cached
	}
	// Calculate base weighted similarity
	baseSimilarity := utils.WeightedSimilarity(preferenceVector, candidateVector, v.weights)

	// Calculate geographic distance
	distance := 0.0
	if currentUser.Latitude.Valid && currentUser.Longitude.Valid &&
		candidate.Latitude.Valid && candidate.Longitude.Valid {
		distance = utils.HaversineDistance(
			currentUser.Latitude.Float64,
			currentUser.Longitude.Float64,
			candidate.Latitude.Float64,
			candidate.Longitude.Float64,
		)
	}

	// Apply distance penalty (closer is better)
	distancePenalty := 1.0
	if distance > 0 {
		distancePenalty = math.Max(0.3, 1.0-distance/100.0) // Penalty increases with distance
	}

	// Calculate age compatibility factor
	ageDifference := int(math.Abs(float64(currentUser.Age - candidate.Age)))
	ageCompatibilityFactor := 1.0
	if ageDifference > v.maxAgeDifference {
		ageCompatibilityFactor = math.Max(0.2, 1.0-float64(ageDifference-v.maxAgeDifference)/20.0)
	}

	// Fame boost (higher fame is slightly more attractive)
	fameBoost := 1.0 + (float64(candidate.Fame)/100.0)*0.1

	// Profile freshness boost (recently updated profiles get small boost)
	freshnessBoost := 1.0
	daysSinceUpdate := time.Since(candidate.UpdatedAt).Hours() / 24
	if daysSinceUpdate < 7 {
		freshnessBoost = 1.05 // 5% boost for profiles updated in last week
	}

	// Add randomness to prevent identical rankings
	randomFactor := 1.0 + (rand.Float64()-0.5)*v.randomnessFactor

	// Calculate final score
	finalScore := baseSimilarity * distancePenalty * ageCompatibilityFactor * fameBoost * freshnessBoost * randomFactor

	// Ensure score is between 0 and 1
	finalScore = math.Max(0, math.Min(1, finalScore))

	factors := map[string]interface{}{
		"base_similarity":           baseSimilarity,
		"distance_penalty":          distancePenalty,
		"age_compatibility_factor":  ageCompatibilityFactor,
		"fame_boost":               fameBoost,
		"freshness_boost":          freshnessBoost,
		"random_factor":            randomFactor,
	}

	score := utils.CompatibilityScore{
		UserID:             candidate.ID,
		CompatibilityScore: finalScore,
		Distance:           distance,
		AgeDifference:      ageDifference,
		Factors:            factors,
	}

	// Cache the score for 10 minutes
	utils.CacheCompatibilityScore(int(currentUser.ID), int(candidate.ID), score, 10*time.Minute)

	return score
}

func (v *VectorMatchingService) RecordInteraction(userID, targetUserID int, action string) (map[string]interface{}, error) {
	// Validate that target user exists
	if err := v.validateUserExists(targetUserID); err != nil {
		return nil, errors.New("target user does not exist")
	}

	// Record the interaction
	var existingInteraction models.UserInteraction
	result := conf.DB.Where("user_id = ? AND target_user_id = ?", userID, targetUserID).
		First(&existingInteraction)
	
	if result.Error == nil {
		existingInteraction.InteractionType = action
		conf.DB.Save(&existingInteraction)
	} else {
		interaction := models.UserInteraction{
			UserID:          uint(userID),
			TargetUserID:    uint(targetUserID),
			InteractionType: action,
		}
		conf.DB.Create(&interaction)
	}

	// Update user preferences based on interaction (preference learning)
	if action == "like" || action == "pass" {
		err := v.updateUserPreferences(userID, targetUserID, action)
		if err != nil {
			log.Printf("Failed to update user preferences: %v", err)
		}

		// Invalidate caches for this user since preferences changed
		utils.InvalidateUserCache(userID)
	}

	response := map[string]interface{}{
		"action":         action,
		"target_user_id": targetUserID,
		"success":        true,
	}

	// Handle like actions - check for mutual match
	if action == "like" {
		var mutualLike models.UserInteraction
		mutualResult := conf.DB.Where("user_id = ? AND target_user_id = ? AND interaction_type = ?", 
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

// validateUserExists checks if a user exists in the database
func (v *VectorMatchingService) validateUserExists(userID int) error {
	var user models.User
	result := conf.DB.First(&user, userID)
	if result.Error != nil {
		return errors.New("user not found")
	}
	return nil
}

// updateUserPreferences updates user preference vector based on interaction
func (v *VectorMatchingService) updateUserPreferences(userID, targetUserID int, action string) error {
	// Get current user and target user
	var currentUser, targetUser models.User
	if err := conf.DB.First(&currentUser, userID).Error; err != nil {
		return err
	}
	if err := conf.DB.First(&targetUser, targetUserID).Error; err != nil {
		return err
	}

	// Convert to vectors
	currentUserVector := utils.UserToVector(&currentUser)
	targetUserVector := utils.UserToVector(&targetUser)

	// Get current preference vector
	preferenceVector, err := v.getUserPreferenceVector(uint(userID), currentUserVector)
	if err != nil {
		return err
	}

	// Update preference vector based on interaction
	isPositive := action == "like"
	updatedPreferences := utils.UpdatePreferenceVector(preferenceVector, targetUserVector, v.learningRate, isPositive)

	// Save updated preferences to database
	var preference models.UserPreference
	result := conf.DB.Where("user_id = ?", userID).First(&preference)
	
	if result.Error != nil {
		// Create new preference record
		preference = models.UserPreference{
			UserID:              uint(userID),
			Age:                 updatedPreferences.Age,
			Height:              updatedPreferences.Height,
			Fame:                updatedPreferences.Fame,
			AlcoholConsumption:  updatedPreferences.AlcoholConsumption,
			Smoking:             updatedPreferences.Smoking,
			Cannabis:            updatedPreferences.Cannabis,
			Drugs:               updatedPreferences.Drugs,
			Pets:                updatedPreferences.Pets,
			SocialActivityLevel: updatedPreferences.SocialActivityLevel,
			SportActivity:       updatedPreferences.SportActivity,
			EducationLevel:      updatedPreferences.EducationLevel,
			Religion:            updatedPreferences.Religion,
			ChildrenStatus:      updatedPreferences.ChildrenStatus,
			PoliticalView:       updatedPreferences.PoliticalView,
			Latitude:            updatedPreferences.Latitude,
			Longitude:           updatedPreferences.Longitude,
			UpdateCount:         1,
		}
		return conf.DB.Create(&preference).Error
	} else {
		// Update existing preference record
		preference.Age = updatedPreferences.Age
		preference.Height = updatedPreferences.Height
		preference.Fame = updatedPreferences.Fame
		preference.AlcoholConsumption = updatedPreferences.AlcoholConsumption
		preference.Smoking = updatedPreferences.Smoking
		preference.Cannabis = updatedPreferences.Cannabis
		preference.Drugs = updatedPreferences.Drugs
		preference.Pets = updatedPreferences.Pets
		preference.SocialActivityLevel = updatedPreferences.SocialActivityLevel
		preference.SportActivity = updatedPreferences.SportActivity
		preference.EducationLevel = updatedPreferences.EducationLevel
		preference.Religion = updatedPreferences.Religion
		preference.ChildrenStatus = updatedPreferences.ChildrenStatus
		preference.PoliticalView = updatedPreferences.PoliticalView
		preference.Latitude = updatedPreferences.Latitude
		preference.Longitude = updatedPreferences.Longitude
		preference.UpdateCount++
		return conf.DB.Save(&preference).Error
	}
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

// GetUserPreferences returns the current learned preferences for a user
func (v *VectorMatchingService) GetUserPreferences(userID int) (map[string]interface{}, error) {
	var currentUser models.User
	if err := conf.DB.First(&currentUser, userID).Error; err != nil {
		return nil, errors.New("user not found")
	}

	currentUserVector := utils.UserToVector(&currentUser)
	preferenceVector, err := v.getUserPreferenceVector(uint(userID), currentUserVector)
	if err != nil {
		return nil, err
	}

	// Get update count and other metadata
	var preference models.UserPreference
	updateCount := 0
	var createdAt, updatedAt interface{}

	if result := conf.DB.Where("user_id = ?", userID).First(&preference); result.Error == nil {
		updateCount = preference.UpdateCount
		createdAt = preference.CreatedAt
		updatedAt = preference.UpdatedAt
	}

	return map[string]interface{}{
		"preference_vector": preferenceVector,
		"metadata": map[string]interface{}{
			"update_count": updateCount,
			"created_at":   createdAt,
			"updated_at":   updatedAt,
		},
		"learning_parameters": map[string]interface{}{
			"learning_rate":      v.learningRate,
			"randomness_factor":  v.randomnessFactor,
			"max_distance_km":    v.maxDistanceKm,
			"max_age_difference": v.maxAgeDifference,
		},
	}, nil
}