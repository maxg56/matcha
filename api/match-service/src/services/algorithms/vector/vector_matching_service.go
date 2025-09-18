package vector

import (
	"log"
	"math/rand"
	"sort"

	"match-service/src/utils"
	"match-service/src/models"
	"match-service/src/services/types"
	"match-service/src/services/users"
	"match-service/src/services/cache"
	"match-service/src/services/algorithms/compatibility"
)

// VectorMatchingService orchestrates the enhanced matching algorithm
type VectorMatchingService struct {
	userService          *users.UserService
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

	// Get potential candidates - this now needs to be handled differently
	// to avoid circular dependencies. For now, we'll implement basic candidate retrieval
	candidates := []models.User{} // TODO: Implement candidate retrieval without circular dependency

	// Calculate compatibility scores
	var scores []utils.CompatibilityScore
	for _, candidate := range candidates {
		candidateVector, err := v.userService.GetUserVector(int(candidate.ID))
		if err != nil {
			log.Printf("Error getting vector for user %d: %v", candidate.ID, err)
			continue
		}
		
		score := v.compatibilityService.CalculateCompatibilityScore(
			userID, int(candidate.ID), preferenceVector, candidateVector, currentUser, &candidate,
		)
		scores = append(scores, score)
	}

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