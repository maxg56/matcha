package core

import (
	"match-service/src/services/types"
	"match-service/src/services/validation"
	"match-service/src/services/cache"
)

// AlgorithmService orchestrates different matching algorithms
type AlgorithmService struct {
	validator    *validation.RequestValidator
	router       *AlgorithmRouter
	cacheManager *cache.CacheManager
	metrics      *AlgorithmMetrics
}

// NewAlgorithmService creates a new AlgorithmService instance
func NewAlgorithmService() *AlgorithmService {
	return &AlgorithmService{
		validator:    validation.NewRequestValidator(),
		router:       NewAlgorithmRouter(),
		cacheManager: cache.NewCacheManager(),
		metrics:      NewAlgorithmMetrics(),
	}
}

// RunMatchingAlgorithm executes the specified matching algorithm
func (a *AlgorithmService) RunMatchingAlgorithm(request *types.MatchingRequest) ([]types.MatchResult, error) {
	// Validate request
	if err := a.validator.ValidateMatchingRequest(request); err != nil {
		return nil, err
	}

	if err := a.validator.ValidateAlgorithmRequirements(request); err != nil {
		return nil, err
	}

	// Check cache first for cacheable algorithms
	if a.cacheManager.ShouldCache(request) {
		if cached, exists := a.cacheManager.GetCachedResults(
			request.UserID, string(request.Algorithm), request.Limit, request.MaxDistance); exists {
			return cached, nil
		}
	}

	// Execute the appropriate algorithm
	results, err := a.router.ExecuteAlgorithm(request)
	if err != nil {
		return nil, err
	}

	// Cache results if appropriate
	if a.cacheManager.ShouldCache(request) {
		a.cacheManager.CacheResults(
			request.UserID, string(request.Algorithm), request.Limit, request.MaxDistance, results)
	}

	return results, nil
}

// GetMatchingCandidates executes the specified matching algorithm and returns only IDs with scores
func (a *AlgorithmService) GetMatchingCandidates(request *types.MatchingRequest) ([]types.MatchCandidate, error) {
	// Validate request
	if err := a.validator.ValidateMatchingRequest(request); err != nil {
		return nil, err
	}

	if err := a.validator.ValidateAlgorithmRequirements(request); err != nil {
		return nil, err
	}

	// Execute the appropriate algorithm
	candidates, err := a.router.ExecuteCandidateAlgorithm(request)
	if err != nil {
		return nil, err
	}

	return candidates, nil
}


// GetAvailableAlgorithms returns all available matching algorithms
func (a *AlgorithmService) GetAvailableAlgorithms() []types.AlgorithmInfo {
	return a.metrics.GetAvailableAlgorithms()
}

// GetAlgorithmPerformanceStats returns performance statistics for algorithms
func (a *AlgorithmService) GetAlgorithmPerformanceStats() map[string]interface{} {
	return a.metrics.GetAlgorithmPerformanceStats()
}

// InvalidateUserAlgorithmCaches clears all cached results for a specific user
func (a *AlgorithmService) InvalidateUserAlgorithmCaches(userID int) {
	a.cacheManager.InvalidateUserCaches(userID)
}