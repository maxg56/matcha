package vector

import (
	"log"
	"math"
	"math/rand"
	"sort"
	"strings"

	"match-service/src/conf"
	"match-service/src/utils"
	"match-service/src/models"
	"match-service/src/services/types"
	"match-service/src/services/users"
	"match-service/src/services/cache"
	"match-service/src/services/preferences"
	"match-service/src/services/algorithms/compatibility"
)

// VectorMatchingService orchestrates the enhanced matching algorithm
type VectorMatchingService struct {
	userService          *users.UserService
	preferencesManager   *preferences.UserPreferencesManager
	compatibilityService *compatibility.CompatibilityService
	cacheService         *cache.CacheService
	maxDistanceKm        int
	maxAgeDifference     int
	randomnessFactor     float64
}

// NewVectorMatchingService creates a new VectorMatchingService with all dependencies
func NewVectorMatchingService() *VectorMatchingService {
	return &VectorMatchingService{
		userService:          users.NewUserService(),
		preferencesManager:   preferences.NewUserPreferencesManager(),
		compatibilityService: compatibility.NewCompatibilityService(),
		cacheService:         cache.NewCacheService(),
		maxDistanceKm:        50,
		maxAgeDifference:     10,
		randomnessFactor:     0.15,
	}
}

func (v *VectorMatchingService) GetPotentialMatches(userID int, limit int, maxDistance *int, ageRange *types.AgeRange) ([]types.MatchResult, error) {
	// Check cache first
	if cached, exists := v.cacheService.GetCachedMatchResults(userID, "enhanced_vector", limit, maxDistance); exists {
		log.Printf("Cache hit for user %d matches", userID)
		return cached, nil
	}

	// Get current user
	currentUser, err := v.userService.GetUser(userID)
	if err != nil {
		return nil, err
	}

	// Get user vector (with caching)
	currentUserVector, err := v.userService.GetUserVector(userID)
	if err != nil {
		return nil, err
	}

	// Use the user's own vector as preference vector (simplified approach)
	preferenceVector := currentUserVector

	// Get potential candidates
	log.Printf("🔍 [DEBUG Vector] Getting candidates for user %d with maxDistance: %v, ageRange: %v", userID, maxDistance, ageRange)
	candidates, err := v.getCandidateUsers(userID, maxDistance, ageRange, currentUser)
	if err != nil {
		log.Printf("❌ [ERROR Vector] Failed to get candidates: %v", err)
		return nil, err
	}
	log.Printf("🔍 [DEBUG Vector] Found %d potential candidates", len(candidates))

	// Calculate compatibility scores
	log.Printf("🔍 [DEBUG Vector] Starting compatibility score calculation for %d candidates", len(candidates))
	var scores []utils.CompatibilityScore
	for i, candidate := range candidates {
		candidateVector, err := v.userService.GetUserVector(int(candidate.ID))
		if err != nil {
			log.Printf("❌ [ERROR Vector] Getting vector for user %d: %v", candidate.ID, err)
			continue
		}

		score := v.compatibilityService.CalculateCompatibilityScore(
			userID, int(candidate.ID), preferenceVector, candidateVector, currentUser, &candidate,
		)
		scores = append(scores, score)

		if i < 3 { // Log first 3 scores for debugging
			log.Printf("🔍 [DEBUG Vector] Candidate %d (ID: %d): score=%.3f, distance=%.2f",
				i+1, candidate.ID, score.CompatibilityScore, score.Distance)
		}
	}
	log.Printf("🔍 [DEBUG Vector] Calculated %d compatibility scores", len(scores))

	// Sort by compatibility score (descending)
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].CompatibilityScore > scores[j].CompatibilityScore
	})

	// Add some randomness to prevent algorithmic monotony
	if v.randomnessFactor > 0 && len(scores) > 1 {
		shuffleTopResults := int(float64(len(scores)) * v.randomnessFactor)
		if shuffleTopResults > len(scores) {
			shuffleTopResults = len(scores)
		}
		
		// Shuffle top portion of results
		for i := 0; i < shuffleTopResults; i++ {
			j := rand.Intn(shuffleTopResults)
			scores[i], scores[j] = scores[j], scores[i]
		}
	}

	// Convert to MatchResult and apply limit
	var results []types.MatchResult
	maxResults := limit
	if maxResults > len(scores) {
		maxResults = len(scores)
	}

	for i := 0; i < maxResults; i++ {
		score := scores[i]
		
		// Get user details
		user, err := v.userService.GetUser(int(score.UserID))
		if err != nil {
			continue
		}

		compatibilityScore := score.CompatibilityScore
		distance := score.Distance

		result := types.MatchResult{
			ID:                 int(user.ID),
			Username:           user.Username,
			FirstName:          user.FirstName,
			Age:                user.Age,
			Bio:                user.Bio,
			Fame:               user.Fame,
			AlgorithmType:      "enhanced_vector",
			CompatibilityScore: &compatibilityScore,
			Distance:           &distance,
		}
		results = append(results, result)
	}

	log.Printf("✅ [DEBUG Vector] Returning %d final match results", len(results))

	// Cache the results for 5 minutes
	v.cacheService.CacheMatchResults(userID, "enhanced_vector", limit, maxDistance, results)

	return results, nil
}

// RecordInteraction is now handled by the InteractionManager to avoid circular dependencies
// This method is kept for backwards compatibility but should be used from the interactions package

// GetUserMatches is now handled by the UserMatchingService to avoid circular dependencies
// This method is kept for backwards compatibility but should be used from the matching package

// GetUserPreferences returns a simple compatibility response (deprecated)
// Use UserPreferencesManager.GetUserMatchingPreferences() instead
func (v *VectorMatchingService) GetUserPreferences(userID int) (map[string]interface{}, error) {
	return map[string]interface{}{
		"message": "Vector-based preferences have been replaced with explicit preferences",
		"use": "UserPreferencesManager.GetUserMatchingPreferences() for actual preferences",
	}, nil
}

// getCandidateUsers retrieves potential candidate users for matching with full preference filtering
func (v *VectorMatchingService) getCandidateUsers(userID int, maxDistance *int, ageRange *types.AgeRange, currentUser *models.User) ([]models.User, error) {
	log.Printf("🔍 [DEBUG Vector] getCandidateUsers for user %d", userID)

	// Get user preferences
	userPreferences, err := v.preferencesManager.GetUserMatchingPreferences(userID)
	if err != nil {
		log.Printf("❌ [ERROR Vector] Failed to get preferences for user %d: %v", userID, err)
		return nil, err
	}

	log.Printf("🔍 [DEBUG Vector] User preferences: MinFame=%d, PreferredGenders=%s, AgeMin=%d, AgeMax=%d",
		userPreferences.MinFame, userPreferences.PreferredGenders, userPreferences.AgeMin, userPreferences.AgeMax)

	query := conf.DB.Where("id != ?", userID)

	// Apply age range filter (use preferences if not overridden)
	if ageRange != nil {
		log.Printf("🔍 [DEBUG Vector] Applying age range filter: %d-%d", ageRange.Min, ageRange.Max)
		query = query.Where("age BETWEEN ? AND ?", ageRange.Min, ageRange.Max)
	}

	// Apply minimum fame filter from preferences
	if userPreferences.MinFame > 0 {
		log.Printf("🔍 [DEBUG Vector] Applying fame filter: >= %d", userPreferences.MinFame)
		query = query.Where("fame >= ?", userPreferences.MinFame)
	}

	// Apply gender preference filtering from preferences
	if userPreferences.PreferredGenders != "" && userPreferences.PreferredGenders != `["man","woman","other"]` {
		log.Printf("🔍 [DEBUG Vector] Applying gender filter: %s", userPreferences.PreferredGenders)
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
	log.Printf("🔍 [DEBUG Vector] Applied seen profiles filter")

	// Apply distance filter if specified
	if maxDistance != nil && currentUser.Latitude.Valid && currentUser.Longitude.Valid {
		log.Printf("🔍 [DEBUG Vector] Applying distance bounding box filter: maxDistance=%d", *maxDistance)
		// Use a simple bounding box for initial filtering (more efficient than Haversine in WHERE clause)
		latDelta := float64(*maxDistance) / 111.0 // Approximate km per degree of latitude
		lonDelta := latDelta / math.Cos(currentUser.Latitude.Float64*math.Pi/180)

		query = query.Where("latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?",
			currentUser.Latitude.Float64-latDelta, currentUser.Latitude.Float64+latDelta,
			currentUser.Longitude.Float64-lonDelta, currentUser.Longitude.Float64+lonDelta)
	}

	var candidates []models.User
	if err := query.Find(&candidates).Error; err != nil {
		log.Printf("❌ [ERROR Vector] Database query failed: %v", err)
		return nil, err
	}

	log.Printf("🔍 [DEBUG Vector] Query returned %d candidates", len(candidates))

	// If distance filter is applied, do precise filtering
	if maxDistance != nil && currentUser.Latitude.Valid && currentUser.Longitude.Valid {
		log.Printf("🔍 [DEBUG Vector] Applying precise distance filter: maxDistance=%d", *maxDistance)
		beforeCount := len(candidates)
		candidates = v.filterByPreciseDistance(candidates, currentUser, *maxDistance)
		log.Printf("🔍 [DEBUG Vector] Distance filter: %d -> %d candidates", beforeCount, len(candidates))
	}

	log.Printf("✅ [DEBUG Vector] Final candidate count: %d", len(candidates))
	return candidates, nil
}

// filterByPreciseDistance filters candidates by precise distance calculation
func (v *VectorMatchingService) filterByPreciseDistance(candidates []models.User, currentUser *models.User, maxDistance int) []models.User {
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