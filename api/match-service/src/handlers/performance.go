package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"match-service/src/conf"
	"match-service/src/services"
	"match-service/src/utils"
)

// GetPerformanceStatsHandler returns performance statistics
func GetPerformanceStatsHandler(c *gin.Context) {
	// Get cache statistics
	cacheStats := utils.GetCacheStats()
	
	// Get database performance statistics
	dbStats, err := utils.GetQueryPerformanceStats(conf.DB)
	if err != nil {
		utils.RespondError(c, "Failed to get database stats: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Get basic service statistics
	serviceStats := map[string]interface{}{
		"uptime":    time.Since(time.Now().Add(-24*time.Hour)).String(), // Placeholder
		"timestamp": time.Now().UTC(),
		"service":   "match-service",
		"version":   "v1.0.0",
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"cache_statistics":    cacheStats,
		"database_statistics": dbStats,
		"service_statistics":  serviceStats,
	})
}

// ClearCacheHandler clears all caches (admin endpoint)
func ClearCacheHandler(c *gin.Context) {
	if utils.CompatibilityCache != nil {
		utils.CompatibilityCache.Clear()
	}
	if utils.UserVectorCache != nil {
		utils.UserVectorCache.Clear()
	}
	if utils.PreferenceCache != nil {
		utils.PreferenceCache.Clear()
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "All caches cleared successfully",
		"cleared_at": time.Now().UTC(),
	})
}

// CreateIndexesHandler manually creates database indexes (admin endpoint)
func CreateIndexesHandler(c *gin.Context) {
	// Create optimization indexes
	err1 := utils.CreateOptimizationIndexes(conf.DB)
	err2 := utils.CreateCompositeIndexesForVectorMatching(conf.DB)
	err3 := utils.AnalyzeTablesForPerformance(conf.DB)

	var errors []string
	if err1 != nil {
		errors = append(errors, "optimization indexes: "+err1.Error())
	}
	if err2 != nil {
		errors = append(errors, "vector indexes: "+err2.Error())
	}
	if err3 != nil {
		errors = append(errors, "table analysis: "+err3.Error())
	}

	response := gin.H{
		"message": "Index creation completed",
		"created_at": time.Now().UTC(),
	}

	if len(errors) > 0 {
		response["warnings"] = errors
	}

	utils.RespondSuccess(c, http.StatusOK, response)
}

// GetCacheHealthHandler returns detailed cache health information
func GetCacheHealthHandler(c *gin.Context) {
	cacheService := services.NewCacheService()
	
	// Get comprehensive cache health
	health := cacheService.GetCacheHealth()
	stats := cacheService.GetCacheStatistics()
	
	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"cache_health": health,
		"cache_statistics": stats,
	})
}