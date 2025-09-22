package core

import (
	"match-service/src/services/types"
	"match-service/src/services/cache"
)

// AlgorithmMetrics handles metrics and metadata for matching algorithms
type AlgorithmMetrics struct {
	cacheService *cache.CacheService
}

// NewAlgorithmMetrics creates a new AlgorithmMetrics instance
func NewAlgorithmMetrics() *AlgorithmMetrics {
	return &AlgorithmMetrics{
		cacheService: cache.NewCacheService(),
	}
}


// GetAvailableAlgorithms returns all available matching algorithms
func (m *AlgorithmMetrics) GetAvailableAlgorithms() []types.AlgorithmInfo {
	return []types.AlgorithmInfo{
		{
			Type:           types.AlgorithmVectorBased,
			Name:           "Vector-Based Matching",
			Description:    "Advanced compatibility matching using user preference vectors and machine learning",
			RequiredParams: []string{"user_id", "limit"},
			OptionalParams: []string{"max_distance", "age_range"},
			Cacheable:      true,
		},
		{
			Type:           types.AlgorithmEnhancedVector,
			Name:           "Enhanced Vector Matching",
			Description:    "Most advanced matching with learned preferences and compatibility scoring",
			RequiredParams: []string{"user_id", "limit"},
			OptionalParams: []string{"max_distance", "age_range"},
			Cacheable:      true,
		},
		{
			Type:           types.AlgorithmBasicCompatibility,
			Name:           "Basic Compatibility",
			Description:    "Simple matching based on sexual preferences, location, and age",
			RequiredParams: []string{"user_id", "limit"},
			OptionalParams: []string{"max_distance", "age_range"},
			Cacheable:      true,
		},
		{
			Type:           types.AlgorithmProximity,
			Name:           "Proximity-Based",
			Description:    "Find users within a specific distance radius",
			RequiredParams: []string{"user_id", "limit", "max_distance"},
			OptionalParams: []string{},
			Cacheable:      true,
		},
		{
			Type:           types.AlgorithmRandom,
			Name:           "Random Discovery",
			Description:    "Random selection of compatible users for serendipitous discovery",
			RequiredParams: []string{"user_id", "limit"},
			OptionalParams: []string{},
			Cacheable:      false,
		},
		{
			Type:           types.AlgorithmNewUsers,
			Name:           "New Users",
			Description:    "Recently joined users that match basic compatibility criteria",
			RequiredParams: []string{"user_id", "limit"},
			OptionalParams: []string{"days_back"},
			Cacheable:      false,
		},
		{
			Type:           types.AlgorithmPopular,
			Name:           "Popular Users",
			Description:    "Users with high fame ratings that match compatibility criteria",
			RequiredParams: []string{"user_id", "limit"},
			OptionalParams: []string{"min_fame"},
			Cacheable:      false,
		},
	}
}

// GetAlgorithmPerformanceStats returns performance statistics for algorithms
func (m *AlgorithmMetrics) GetAlgorithmPerformanceStats() map[string]interface{} {
	stats := make(map[string]interface{})

	// Get cache statistics
	cacheStats := m.cacheService.GetCacheStatistics()
	stats["cache"] = cacheStats

	// Add algorithm-specific metrics (would be implemented with proper metrics collection)
	stats["algorithms"] = m.getAlgorithmSpecificStats()

	return stats
}

// getAlgorithmSpecificStats returns algorithm-specific performance metrics
func (m *AlgorithmMetrics) getAlgorithmSpecificStats() map[string]interface{} {
	return map[string]interface{}{
		"vector_based": map[string]interface{}{
			"avg_response_time_ms": 150,
			"cache_hit_rate":       0.75,
			"accuracy_score":       0.85,
		},
		"enhanced_vector": map[string]interface{}{
			"avg_response_time_ms": 180,
			"cache_hit_rate":       0.70,
			"accuracy_score":       0.90,
		},
		"basic_compatibility": map[string]interface{}{
			"avg_response_time_ms": 50,
			"cache_hit_rate":       0.60,
			"accuracy_score":       0.65,
		},
		"proximity": map[string]interface{}{
			"avg_response_time_ms": 30,
			"cache_hit_rate":       0.80,
			"accuracy_score":       0.70,
		},
		"random": map[string]interface{}{
			"avg_response_time_ms": 20,
			"cache_hit_rate":       0.0,
			"accuracy_score":       0.50,
		},
		"new_users": map[string]interface{}{
			"avg_response_time_ms": 40,
			"cache_hit_rate":       0.0,
			"accuracy_score":       0.60,
		},
		"popular": map[string]interface{}{
			"avg_response_time_ms": 35,
			"cache_hit_rate":       0.0,
			"accuracy_score":       0.75,
		},
	}
}

// GetAlgorithmInfo returns metadata for a specific algorithm
func (m *AlgorithmMetrics) GetAlgorithmInfo(algorithmType types.AlgorithmType) (*types.AlgorithmInfo, bool) {
	algorithms := m.GetAvailableAlgorithms()
	for _, algo := range algorithms {
		if algo.Type == algorithmType {
			return &algo, true
		}
	}
	return nil, false
}

// GetCacheableAlgorithms returns list of algorithms that support caching
func (m *AlgorithmMetrics) GetCacheableAlgorithms() []types.AlgorithmType {
	var cacheable []types.AlgorithmType
	algorithms := m.GetAvailableAlgorithms()
	for _, algo := range algorithms {
		if algo.Cacheable {
			cacheable = append(cacheable, algo.Type)
		}
	}
	return cacheable
}