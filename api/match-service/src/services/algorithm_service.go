package services

import (
	"errors"
	"fmt"
)

// AlgorithmService orchestrates different matching algorithms
type AlgorithmService struct {
	vectorMatchingService *VectorMatchingService
	basicMatchingService  *BasicMatchingService
	cacheService          *CacheService
}

// AlgorithmType represents different matching algorithm types
type AlgorithmType string

const (
	AlgorithmVectorBased     AlgorithmType = "vector_based"
	AlgorithmEnhancedVector  AlgorithmType = "enhanced_vector"
	AlgorithmBasicCompatibility AlgorithmType = "basic_compatibility"
	AlgorithmProximity       AlgorithmType = "proximity"
	AlgorithmRandom          AlgorithmType = "random"
	AlgorithmNewUsers        AlgorithmType = "new_users"
	AlgorithmPopular         AlgorithmType = "popular"
)

// MatchingRequest encapsulates all parameters for a matching request
type MatchingRequest struct {
	UserID      int        `json:"user_id"`
	Algorithm   AlgorithmType `json:"algorithm"`
	Limit       int        `json:"limit"`
	MaxDistance *int       `json:"max_distance,omitempty"`
	AgeRange    *AgeRange  `json:"age_range,omitempty"`
	MinFame     *int       `json:"min_fame,omitempty"`
	DaysBack    *int       `json:"days_back,omitempty"`
}

// NewAlgorithmService creates a new AlgorithmService instance
func NewAlgorithmService() *AlgorithmService {
	return &AlgorithmService{
		vectorMatchingService: NewVectorMatchingService(),
		basicMatchingService:  NewBasicMatchingService(),
		cacheService:          NewCacheService(),
	}
}

// RunMatchingAlgorithm executes the specified matching algorithm
func (a *AlgorithmService) RunMatchingAlgorithm(request *MatchingRequest) ([]MatchResult, error) {
	// Validate request
	if err := a.validateMatchingRequest(request); err != nil {
		return nil, err
	}

	// Check cache first for cacheable algorithms
	if a.isCacheable(request.Algorithm) {
		if cached, exists := a.cacheService.GetCachedMatchResults(
			request.UserID, string(request.Algorithm), request.Limit, request.MaxDistance); exists {
			return cached, nil
		}
	}

	// Execute the appropriate algorithm
	results, err := a.executeAlgorithm(request)
	if err != nil {
		return nil, err
	}

	// Cache results if appropriate
	if a.isCacheable(request.Algorithm) {
		a.cacheService.CacheMatchResults(
			request.UserID, string(request.Algorithm), request.Limit, request.MaxDistance, results)
	}

	return results, nil
}

// GetMatchingCandidates executes the specified matching algorithm and returns only IDs with scores
func (a *AlgorithmService) GetMatchingCandidates(request *MatchingRequest) ([]MatchCandidate, error) {
	// Validate request
	if err := a.validateMatchingRequest(request); err != nil {
		return nil, err
	}

	// Check cache first for cacheable algorithms (we could implement separate caching for candidates)
	// For now, we skip caching to keep it simple

	// Execute the appropriate algorithm
	candidates, err := a.executeCandidateAlgorithm(request)
	if err != nil {
		return nil, err
	}

	return candidates, nil
}

// executeAlgorithm routes to the appropriate matching algorithm
func (a *AlgorithmService) executeAlgorithm(request *MatchingRequest) ([]MatchResult, error) {
	switch request.Algorithm {
	case AlgorithmVectorBased, AlgorithmEnhancedVector:
		return a.vectorMatchingService.GetPotentialMatches(
			request.UserID, request.Limit, request.MaxDistance, request.AgeRange)
	
	case AlgorithmBasicCompatibility:
		return a.basicMatchingService.GetMatches(
			request.UserID, request.Limit, request.MaxDistance, request.AgeRange)
	
	case AlgorithmProximity:
		if request.MaxDistance == nil {
			return nil, errors.New("max_distance is required for proximity algorithm")
		}
		return a.basicMatchingService.GetNearbyUsers(
			request.UserID, *request.MaxDistance, request.Limit)
	
	case AlgorithmRandom:
		return a.basicMatchingService.GetRandomMatches(request.UserID, request.Limit)
	
	case AlgorithmNewUsers:
		daysBack := 7 // Default to 7 days
		if request.DaysBack != nil {
			daysBack = *request.DaysBack
		}
		return a.basicMatchingService.GetNewUsers(request.UserID, request.Limit, daysBack)
	
	case AlgorithmPopular:
		minFame := 0 // Default minimum fame
		if request.MinFame != nil {
			minFame = *request.MinFame
		}
		return a.basicMatchingService.GetPopularUsers(request.UserID, request.Limit, minFame)
	
	default:
		return nil, fmt.Errorf("unknown algorithm type: %s", request.Algorithm)
	}
}

// executeCandidateAlgorithm routes to the appropriate matching algorithm and returns only candidates
func (a *AlgorithmService) executeCandidateAlgorithm(request *MatchingRequest) ([]MatchCandidate, error) {
	// For now, we'll convert full results to candidates
	// This is a temporary solution until we implement dedicated candidate methods in each service
	results, err := a.executeAlgorithm(request)
	if err != nil {
		return nil, err
	}

	// Convert MatchResult to MatchCandidate
	candidates := make([]MatchCandidate, len(results))
	for i, result := range results {
		candidates[i] = MatchCandidate{
			ID:                 result.ID,
			AlgorithmType:      result.AlgorithmType,
			CompatibilityScore: result.CompatibilityScore,
			Distance:           result.Distance,
		}
	}

	return candidates, nil
}

// validateMatchingRequest validates the matching request parameters
func (a *AlgorithmService) validateMatchingRequest(request *MatchingRequest) error {
	if request == nil {
		return errors.New("matching request cannot be nil")
	}

	if request.UserID <= 0 {
		return errors.New("user_id must be positive")
	}

	if request.Limit <= 0 {
		return errors.New("limit must be positive")
	}

	if request.Limit > 100 {
		return errors.New("limit cannot exceed 100")
	}

	if request.MaxDistance != nil && *request.MaxDistance <= 0 {
		return errors.New("max_distance must be positive")
	}

	if request.AgeRange != nil {
		if request.AgeRange.Min < 18 || request.AgeRange.Min > 100 {
			return errors.New("age range minimum must be between 18 and 100")
		}
		if request.AgeRange.Max < 18 || request.AgeRange.Max > 100 {
			return errors.New("age range maximum must be between 18 and 100")
		}
		if request.AgeRange.Min > request.AgeRange.Max {
			return errors.New("age range minimum cannot be greater than maximum")
		}
	}

	if request.MinFame != nil && *request.MinFame < 0 {
		return errors.New("min_fame cannot be negative")
	}

	if request.DaysBack != nil && *request.DaysBack <= 0 {
		return errors.New("days_back must be positive")
	}

	return nil
}

// isCacheable determines if an algorithm's results should be cached
func (a *AlgorithmService) isCacheable(algorithm AlgorithmType) bool {
	switch algorithm {
	case AlgorithmVectorBased, AlgorithmEnhancedVector, AlgorithmBasicCompatibility, AlgorithmProximity:
		return true
	case AlgorithmRandom, AlgorithmNewUsers, AlgorithmPopular:
		return false // These change frequently or should be fresh
	default:
		return false
	}
}

// GetAvailableAlgorithms returns all available matching algorithms
func (a *AlgorithmService) GetAvailableAlgorithms() []AlgorithmInfo {
	return []AlgorithmInfo{
		{
			Type:        AlgorithmVectorBased,
			Name:        "Vector-Based Matching",
			Description: "Advanced compatibility matching using user preference vectors and machine learning",
			RequiredParams: []string{"user_id", "limit"},
			OptionalParams: []string{"max_distance", "age_range"},
			Cacheable:   true,
		},
		{
			Type:        AlgorithmEnhancedVector,
			Name:        "Enhanced Vector Matching",
			Description: "Most advanced matching with learned preferences and compatibility scoring",
			RequiredParams: []string{"user_id", "limit"},
			OptionalParams: []string{"max_distance", "age_range"},
			Cacheable:   true,
		},
		{
			Type:        AlgorithmBasicCompatibility,
			Name:        "Basic Compatibility",
			Description: "Simple matching based on sexual preferences, location, and age",
			RequiredParams: []string{"user_id", "limit"},
			OptionalParams: []string{"max_distance", "age_range"},
			Cacheable:   true,
		},
		{
			Type:        AlgorithmProximity,
			Name:        "Proximity-Based",
			Description: "Find users within a specific distance radius",
			RequiredParams: []string{"user_id", "limit", "max_distance"},
			OptionalParams: []string{},
			Cacheable:   true,
		},
		{
			Type:        AlgorithmRandom,
			Name:        "Random Discovery",
			Description: "Random selection of compatible users for serendipitous discovery",
			RequiredParams: []string{"user_id", "limit"},
			OptionalParams: []string{},
			Cacheable:   false,
		},
		{
			Type:        AlgorithmNewUsers,
			Name:        "New Users",
			Description: "Recently joined users that match basic compatibility criteria",
			RequiredParams: []string{"user_id", "limit"},
			OptionalParams: []string{"days_back"},
			Cacheable:   false,
		},
		{
			Type:        AlgorithmPopular,
			Name:        "Popular Users",
			Description: "Users with high fame ratings that match compatibility criteria",
			RequiredParams: []string{"user_id", "limit"},
			OptionalParams: []string{"min_fame"},
			Cacheable:   false,
		},
	}
}

// AlgorithmInfo provides metadata about a matching algorithm
type AlgorithmInfo struct {
	Type           AlgorithmType `json:"type"`
	Name           string        `json:"name"`
	Description    string        `json:"description"`
	RequiredParams []string      `json:"required_params"`
	OptionalParams []string      `json:"optional_params"`
	Cacheable      bool          `json:"cacheable"`
}

// GetAlgorithmPerformanceStats returns performance statistics for algorithms
func (a *AlgorithmService) GetAlgorithmPerformanceStats() map[string]interface{} {
	stats := make(map[string]interface{})
	
	// Get cache statistics
	cacheStats := a.cacheService.GetCacheStatistics()
	stats["cache"] = cacheStats
	
	// Add algorithm-specific metrics (would be implemented with proper metrics collection)
	stats["algorithms"] = map[string]interface{}{
		"vector_based": map[string]interface{}{
			"avg_response_time_ms": 150,
			"cache_hit_rate":      0.75,
			"accuracy_score":      0.85,
		},
		"basic_compatibility": map[string]interface{}{
			"avg_response_time_ms": 50,
			"cache_hit_rate":      0.60,
			"accuracy_score":      0.65,
		},
		"proximity": map[string]interface{}{
			"avg_response_time_ms": 30,
			"cache_hit_rate":      0.80,
			"accuracy_score":      0.70,
		},
	}
	
	return stats
}

// InvalidateUserAlgorithmCaches clears all cached results for a specific user
func (a *AlgorithmService) InvalidateUserAlgorithmCaches(userID int) {
	a.cacheService.InvalidateUserCaches(userID)
}

// BuildMatchingRequest creates a MatchingRequest from individual parameters
func BuildMatchingRequest(userID int, algorithmType string, limit int, maxDistance *int, ageRange *AgeRange) *MatchingRequest {
	return &MatchingRequest{
		UserID:      userID,
		Algorithm:   AlgorithmType(algorithmType),
		Limit:       limit,
		MaxDistance: maxDistance,
		AgeRange:    ageRange,
	}
}