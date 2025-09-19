package cache

import (
	"fmt"
	"match-service/src/services/types"
)

// CacheManager handles caching logic for matching algorithms
type CacheManager struct {
	cacheService *CacheService
}

// NewCacheManager creates a new CacheManager instance
func NewCacheManager() *CacheManager {
	return &CacheManager{
		cacheService: NewCacheService(),
	}
}

// IsCacheable determines if an algorithm's results should be cached
func (c *CacheManager) IsCacheable(algorithm types.AlgorithmType) bool {
	switch algorithm {
	case types.AlgorithmVectorBased, types.AlgorithmEnhancedVector, types.AlgorithmBasicCompatibility, types.AlgorithmProximity:
		return true
	case types.AlgorithmRandom, types.AlgorithmNewUsers, types.AlgorithmPopular:
		return false // These change frequently or should be fresh
	default:
		return false
	}
}

// GetCachedResults retrieves cached match results if available
func (c *CacheManager) GetCachedResults(userID int, algorithm string, limit int, maxDistance *int) ([]types.MatchResult, bool) {
	return c.cacheService.GetCachedMatchResults(userID, algorithm, limit, maxDistance)
}

// CacheResults stores match results in cache
func (c *CacheManager) CacheResults(userID int, algorithm string, limit int, maxDistance *int, results []types.MatchResult) {
	c.cacheService.CacheMatchResults(userID, algorithm, limit, maxDistance, results)
}

// InvalidateUserCaches clears all cached results for a specific user
func (c *CacheManager) InvalidateUserCaches(userID int) {
	c.cacheService.InvalidateUserCaches(userID)
}

// GetCacheStatistics returns cache performance statistics
func (c *CacheManager) GetCacheStatistics() map[string]interface{} {
	return c.cacheService.GetCacheStatistics()
}

// ShouldCache determines if results should be cached based on algorithm and request
func (c *CacheManager) ShouldCache(request *types.MatchingRequest) bool {
	if !c.IsCacheable(request.Algorithm) {
		return false
	}

	// Additional caching logic can be added here
	// For example, don't cache if limit is too small or too large
	if request.Limit < 5 || request.Limit > 50 {
		return false
	}

	return true
}

// BuildCacheKey creates a unique cache key for the request
func (c *CacheManager) BuildCacheKey(request *types.MatchingRequest) string {
	// This would create a cache key based on request parameters
	// For now, we'll use a simple implementation
	return fmt.Sprintf("match:%d:%s:%d:%v", request.UserID, request.Algorithm, request.Limit, request.MaxDistance)
}