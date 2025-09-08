package utils

import (
	"log"

	"gorm.io/gorm"
)

// CreateOptimizationIndexes creates database indexes for performance optimization
func CreateOptimizationIndexes(db *gorm.DB) error {
	log.Println("Creating performance optimization indexes...")

	// User table indexes
	userIndexes := []string{
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_age ON users(age) WHERE age IS NOT NULL;",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_gender_sex_pref ON users(gender, sex_pref);",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_location ON users(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_fame ON users(fame);",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_updated_at ON users(updated_at);",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_profile ON users(id, updated_at, fame) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;",
	}

	// User interactions table indexes
	interactionIndexes := []string{
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_user_target ON user_interactions(user_id, target_user_id);",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_target_user ON user_interactions(target_user_id, user_id);",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_user_type ON user_interactions(user_id, interaction_type);",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_target_type ON user_interactions(target_user_id, interaction_type);",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_mutual_like ON user_interactions(user_id, target_user_id, interaction_type) WHERE interaction_type = 'like';",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_blocks ON user_interactions(user_id, target_user_id) WHERE interaction_type = 'block';",
	}

	// Matches table indexes
	matchIndexes := []string{
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_user1_active ON matches(user1_id, is_active) WHERE is_active = true;",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_user2_active ON matches(user2_id, is_active) WHERE is_active = true;",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_users_active ON matches(user1_id, user2_id) WHERE is_active = true;",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_active ON matches(is_active, created_at) WHERE is_active = true;",
	}

	// User preferences table indexes
	preferenceIndexes := []string{
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);",
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_update_count ON user_preferences(user_id, update_count);",
	}

	// Execute all index creation queries
	allIndexes := append(userIndexes, interactionIndexes...)
	allIndexes = append(allIndexes, matchIndexes...)
	allIndexes = append(allIndexes, preferenceIndexes...)

	for _, indexSQL := range allIndexes {
		if err := db.Exec(indexSQL).Error; err != nil {
			log.Printf("Warning: Failed to create index: %s - %v", indexSQL, err)
			// Continue with other indexes even if one fails
		} else {
			log.Printf("Successfully created index")
		}
	}

	log.Println("Database indexing optimization completed")
	return nil
}

// CreateCompositeIndexesForVectorMatching creates specialized indexes for vector matching queries
func CreateCompositeIndexesForVectorMatching(db *gorm.DB) error {
	log.Println("Creating vector matching composite indexes...")

	vectorIndexes := []string{
		// Composite index for candidate selection with age and location filters
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_matching_candidates ON users(id, age, latitude, longitude, updated_at, fame) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;",
		
		// Index for quick exclusion of blocked users
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blocked_users_exclusion ON user_interactions(user_id, target_user_id, interaction_type) WHERE interaction_type IN ('block');",
		
		// Index for finding mutual likes efficiently
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mutual_likes ON user_interactions(target_user_id, user_id, interaction_type) WHERE interaction_type = 'like';",
		
		// Index for active matches with user ordering
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_matches_ordered ON matches(user1_id, user2_id, is_active, created_at) WHERE is_active = true;",
		
		// Lifestyle attributes index for vector similarity
		"CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_lifestyle ON users(alcohol_consumption, smoking, cannabis, drugs, pets, social_activity_level, sport_activity) WHERE alcohol_consumption IS NOT NULL;",
	}

	for _, indexSQL := range vectorIndexes {
		if err := db.Exec(indexSQL).Error; err != nil {
			log.Printf("Warning: Failed to create vector index: %s - %v", indexSQL, err)
		} else {
			log.Printf("Successfully created vector matching index")
		}
	}

	log.Println("Vector matching indexing completed")
	return nil
}

// AnalyzeTablesForPerformance runs ANALYZE on key tables to update statistics
func AnalyzeTablesForPerformance(db *gorm.DB) error {
	log.Println("Analyzing tables for query performance...")

	tables := []string{"users", "user_interactions", "matches", "user_preferences"}
	
	for _, table := range tables {
		analyzeSQL := "ANALYZE " + table + ";"
		if err := db.Exec(analyzeSQL).Error; err != nil {
			log.Printf("Warning: Failed to analyze table %s: %v", table, err)
		} else {
			log.Printf("Analyzed table: %s", table)
		}
	}

	log.Println("Table analysis completed")
	return nil
}

// GetQueryPerformanceStats returns basic performance statistics
func GetQueryPerformanceStats(db *gorm.DB) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Get table sizes
	var tableStats []struct {
		TableName string `json:"table_name"`
		RowCount  int64  `json:"row_count"`
		TableSize string `json:"table_size"`
	}

	sizeQuery := `
		SELECT 
			schemaname||'.'||tablename as table_name,
			n_tup_ins + n_tup_upd + n_tup_del as row_count,
			pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
		FROM pg_stat_user_tables 
		WHERE tablename IN ('users', 'user_interactions', 'matches', 'user_preferences')
		ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
	`

	if err := db.Raw(sizeQuery).Scan(&tableStats).Error; err != nil {
		log.Printf("Warning: Could not get table statistics: %v", err)
	} else {
		stats["table_stats"] = tableStats
	}

	// Get index usage stats
	var indexStats []struct {
		IndexName string `json:"index_name"`
		TableName string `json:"table_name"`
		IndexScans int64 `json:"index_scans"`
		IndexSize  string `json:"index_size"`
	}

	indexQuery := `
		SELECT 
			indexrelname as index_name,
			tablename as table_name,
			idx_scan as index_scans,
			pg_size_pretty(pg_relation_size(indexrelname::regclass)) as index_size
		FROM pg_stat_user_indexes 
		WHERE tablename IN ('users', 'user_interactions', 'matches', 'user_preferences')
		AND idx_scan > 0
		ORDER BY idx_scan DESC
		LIMIT 20;
	`

	if err := db.Raw(indexQuery).Scan(&indexStats).Error; err != nil {
		log.Printf("Warning: Could not get index statistics: %v", err)
	} else {
		stats["index_stats"] = indexStats
	}

	return stats, nil
}