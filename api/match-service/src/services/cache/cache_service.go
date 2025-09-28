package cache

import (
	"time"

	"match-service/src/utils"
	"match-service/src/services/types"
)

// CacheService provides high-level caching operations for match service
type CacheService struct{}

// NewCacheService creates a new CacheService instance
func NewCacheService() *CacheService {
	return &CacheService{}
}

// CacheMatchResults caches algorithm results for a user
func (c *CacheService) CacheMatchResults(userID int, algorithmType string, limit int, maxDistance *int, results []types.MatchResult) {
	cacheKey := utils.AlgorithmResultsCacheKey(userID, algorithmType, limit, maxDistance)
	utils.CompatibilityCache.Set(cacheKey, results, 5*time.Minute)
}

// GetCachedMatchResults retrieves cached algorithm results for a user
func (c *CacheService) GetCachedMatchResults(userID int, algorithmType string, limit int, maxDistance *int) ([]types.MatchResult, bool) {
	cacheKey := utils.AlgorithmResultsCacheKey(userID, algorithmType, limit, maxDistance)
	if cached, exists := utils.CompatibilityCache.Get(cacheKey); exists {
		if results, ok := cached.([]types.MatchResult); ok {
			return results, true
		}
	}
	return nil, false
}

// CacheUserMatches caches user's active matches
func (c *CacheService) CacheUserMatches(userID int, matches []types.MatchResult) {
	cacheKey := utils.UserMatchesCacheKey(userID)
	utils.UserVectorCache.Set(cacheKey, matches, 2*time.Minute) // Shorter TTL for dynamic data
}

// GetCachedUserMatches retrieves cached user matches
func (c *CacheService) GetCachedUserMatches(userID int) ([]types.MatchResult, bool) {
	cacheKey := utils.UserMatchesCacheKey(userID)
	if cached, exists := utils.UserVectorCache.Get(cacheKey); exists {
		if matches, ok := cached.([]types.MatchResult); ok {
			return matches, true
		}
	}
	return nil, false
}

// InvalidateUserCaches removes all cached data for a specific user
func (c *CacheService) InvalidateUserCaches(userID int) {
	utils.InvalidateUserCache(userID)
}

// GetCacheStatistics returns comprehensive cache statistics
func (c *CacheService) GetCacheStatistics() map[string]interface{} {
	stats := utils.GetCacheStats()
	
	// Add additional service-level statistics
	stats["cache_backend"] = c.getCacheBackendType()
	stats["last_updated"] = time.Now()
	
	return stats
}

// getCacheBackendType determines which cache backend is being used
func (c *CacheService) getCacheBackendType() string {
	switch utils.CompatibilityCache.(type) {
	case *utils.RedisCache:
		return "redis"
	case *utils.InMemoryCache:
		return "in-memory"
	default:
		return "unknown"
	}
}

// WarmupCache pre-loads frequently accessed data
func (c *CacheService) WarmupCache(userID int) error {
	// This could be extended to pre-load user vectors, preferences, etc.
	// For now, it's a placeholder for future implementation
	return nil
}

// ClearUserSpecificCaches removes caches that are specific to a user
// This is useful when a user updates their profile
func (c *CacheService) ClearUserSpecificCaches(userID int) {
	// Clear user vector cache
	userVectorKey := utils.UserVectorCacheKey(userID)
	utils.UserVectorCache.Delete(userVectorKey)
	
	// Clear preference cache
	preferenceKey := utils.PreferenceCacheKey(userID)
	utils.PreferenceCache.Delete(preferenceKey)
	
	// Clear match caches
	matchesKey := utils.UserMatchesCacheKey(userID)
	utils.UserVectorCache.Delete(matchesKey)
	
	// Note: Compatibility scores with other users are handled by InvalidateUserCache
}

// GetCacheHealth checks the health of cache backends
func (c *CacheService) GetCacheHealth() map[string]interface{} {
	health := make(map[string]interface{})
	
	// Check if caches are responsive
	testKey := "health:test"
	testValue := time.Now().Unix()
	
	// Test CompatibilityCache
	if utils.CompatibilityCache != nil {
		if err := utils.CompatibilityCache.Set(testKey, testValue, 1*time.Second); err != nil {
			health["compatibility_cache"] = "unhealthy: " + err.Error()
		} else {
			health["compatibility_cache"] = "healthy"
			utils.CompatibilityCache.Delete(testKey) // Clean up
		}
	} else {
		health["compatibility_cache"] = "not initialized"
	}
	
	// Test UserVectorCache
	if utils.UserVectorCache != nil {
		if err := utils.UserVectorCache.Set(testKey, testValue, 1*time.Second); err != nil {
			health["user_vector_cache"] = "unhealthy: " + err.Error()
		} else {
			health["user_vector_cache"] = "healthy"
			utils.UserVectorCache.Delete(testKey) // Clean up
		}
	} else {
		health["user_vector_cache"] = "not initialized"
	}
	
	// Test PreferenceCache
	if utils.PreferenceCache != nil {
		if err := utils.PreferenceCache.Set(testKey, testValue, 1*time.Second); err != nil {
			health["preference_cache"] = "unhealthy: " + err.Error()
		} else {
			health["preference_cache"] = "healthy"
			utils.PreferenceCache.Delete(testKey) // Clean up
		}
	} else {
		health["preference_cache"] = "not initialized"
	}
	
	health["timestamp"] = time.Now()
	
	return health
}