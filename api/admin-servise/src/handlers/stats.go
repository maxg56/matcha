package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"admin-service/src/conf"
	"admin-service/src/utils"
)

type UserMatchStats struct {
	UserID       int        `json:"user_id"`
	Username     string     `json:"username,omitempty"`
	TotalMatches int        `json:"total_matches"`
	TotalLikes   int        `json:"total_likes"`
	TotalPasses  int        `json:"total_passes"`
	TotalBlocks  int        `json:"total_blocks"`
	MatchRate    float64    `json:"match_rate"`
	LastActive   *time.Time `json:"last_active,omitempty"`
}

type AdminStatsResponse struct {
	TotalUsers        int64             `json:"total_users"`
	TotalMatches      int64             `json:"total_matches"`
	TotalInteractions int64             `json:"total_interactions"`
	MatchRate         float64           `json:"overall_match_rate"`
	TopUsers          []UserMatchStats  `json:"top_users"`
	DailyStats        []DayStats        `json:"daily_stats"`
	InteractionTypes  []InteractionStat `json:"interaction_types"`
}

type DayStats struct {
	Date            string `json:"date"`
	NewMatches      int    `json:"new_matches"`
	NewInteractions int    `json:"new_interactions"`
	ActiveUsers     int    `json:"active_users"`
}

type InteractionStat struct {
	Type  string `json:"type"`
	Count int    `json:"count"`
}

// GetAdminStatsHandler returns comprehensive statistics for admin dashboard
func GetAdminStatsHandler(c *gin.Context) {
	db := conf.DB

	var stats AdminStatsResponse

	// Get total users count
	if err := db.Table("users").Count(&stats.TotalUsers).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to get users count: "+err.Error())
		return
	}

	// Get total matches count
	if err := db.Table("matches").Count(&stats.TotalMatches).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to get matches count: "+err.Error())
		return
	}

	// Get total interactions count
	if err := db.Table("user_interactions").Count(&stats.TotalInteractions).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to get interactions count: "+err.Error())
		return
	}

	// Calculate overall match rate
	if stats.TotalInteractions > 0 {
		var likeCount int64
		db.Table("user_interactions").Where("interaction_type = ?", "like").Count(&likeCount)
		stats.MatchRate = float64(stats.TotalMatches) / float64(likeCount) * 100
	}

	// Get top users by matches
	topUsersQuery := `
		SELECT
			u.id as user_id,
			u.username,
			COUNT(DISTINCT m.id) as total_matches,
			COUNT(DISTINCT CASE WHEN ui.interaction_type = 'like' THEN ui.id END) as total_likes,
			COUNT(DISTINCT CASE WHEN ui.interaction_type = 'pass' THEN ui.id END) as total_passes,
			COUNT(DISTINCT CASE WHEN ui.interaction_type = 'block' THEN ui.id END) as total_blocks,
			CASE
				WHEN COUNT(DISTINCT CASE WHEN ui.interaction_type = 'like' THEN ui.id END) > 0
				THEN COUNT(DISTINCT m.id)::float / COUNT(DISTINCT CASE WHEN ui.interaction_type = 'like' THEN ui.id END)::float * 100
				ELSE 0
			END as match_rate,
			MAX(ui.created_at) as last_active
		FROM users u
		LEFT JOIN matches m ON (u.id = m.user1_id OR u.id = m.user2_id)
		LEFT JOIN user_interactions ui ON u.id = ui.user_id
		GROUP BY u.id, u.username
		ORDER BY total_matches DESC
		LIMIT 10
	`

	if err := db.Raw(topUsersQuery).Scan(&stats.TopUsers).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to get top users: "+err.Error())
		return
	}

	// Get daily stats for the last 30 days
	dailyStatsQuery := `
		SELECT
			DATE(created_at) as date,
			COUNT(DISTINCT CASE WHEN source_table = 'matches' THEN id END) as new_matches,
			COUNT(DISTINCT CASE WHEN source_table = 'interactions' THEN id END) as new_interactions,
			COUNT(DISTINCT user_id) as active_users
		FROM (
			SELECT id, user1_id as user_id, matched_at as created_at, 'matches' as source_table FROM matches WHERE matched_at >= CURRENT_DATE - INTERVAL '30 days'
			UNION ALL
			SELECT id, user2_id as user_id, matched_at as created_at, 'matches' as source_table FROM matches WHERE matched_at >= CURRENT_DATE - INTERVAL '30 days'
			UNION ALL
			SELECT id, user_id, created_at, 'interactions' as source_table FROM user_interactions WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
		) combined
		GROUP BY DATE(created_at)
		ORDER BY date DESC
		LIMIT 30
	`

	if err := db.Raw(dailyStatsQuery).Scan(&stats.DailyStats).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to get daily stats: "+err.Error())
		return
	}

	// Get interaction type breakdown
	interactionStatsQuery := `
		SELECT
			interaction_type as type,
			COUNT(*) as count
		FROM user_interactions
		WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY interaction_type
		ORDER BY count DESC
	`

	if err := db.Raw(interactionStatsQuery).Scan(&stats.InteractionTypes).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to get interaction stats: "+err.Error())
		return
	}

	utils.RespondOK(c, stats)
}

// GetUserStatsHandler returns detailed statistics for a specific user
func GetUserStatsHandler(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	db := conf.DB
	var userStats UserMatchStats

	// Get user stats
	userStatsQuery := `
		SELECT
			u.id as user_id,
			u.username,
			COUNT(DISTINCT m.id) as total_matches,
			COUNT(DISTINCT CASE WHEN ui.interaction_type = 'like' THEN ui.id END) as total_likes,
			COUNT(DISTINCT CASE WHEN ui.interaction_type = 'pass' THEN ui.id END) as total_passes,
			COUNT(DISTINCT CASE WHEN ui.interaction_type = 'block' THEN ui.id END) as total_blocks,
			CASE
				WHEN COUNT(DISTINCT CASE WHEN ui.interaction_type = 'like' THEN ui.id END) > 0
				THEN COUNT(DISTINCT m.id)::float / COUNT(DISTINCT CASE WHEN ui.interaction_type = 'like' THEN ui.id END)::float * 100
				ELSE 0
			END as match_rate,
			MAX(ui.created_at) as last_active
		FROM users u
		LEFT JOIN matches m ON (u.id = m.user1_id OR u.id = m.user2_id)
		LEFT JOIN user_interactions ui ON u.id = ui.user_id
		WHERE u.id = ?
		GROUP BY u.id, u.username
	`

	if err := db.Raw(userStatsQuery, userID).Scan(&userStats).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to get user stats: "+err.Error())
		return
	}

	if userStats.UserID == 0 {
		utils.RespondError(c, http.StatusNotFound, "User not found")
		return
	}

	utils.RespondOK(c, userStats)
}

// GetMatchTrendsHandler returns matching trends over time
func GetMatchTrendsHandler(c *gin.Context) {
	db := conf.DB

	days := 30
	if daysStr := c.Query("days"); daysStr != "" {
		if parsedDays, err := strconv.Atoi(daysStr); err == nil && parsedDays > 0 && parsedDays <= 365 {
			days = parsedDays
		}
	}

	type TrendData struct {
		Date   string `json:"date"`
		Matches int   `json:"matches"`
		Likes   int   `json:"likes"`
		Passes  int   `json:"passes"`
	}

	var trends []TrendData

	trendsQuery := `
		SELECT
			DATE(created_at) as date,
			COUNT(DISTINCT CASE WHEN source_table = 'matches' THEN id END) as matches,
			COUNT(DISTINCT CASE WHEN source_table = 'interactions' AND interaction_type = 'like' THEN id END) as likes,
			COUNT(DISTINCT CASE WHEN source_table = 'interactions' AND interaction_type = 'pass' THEN id END) as passes
		FROM (
			SELECT id, matched_at as created_at, 'matches' as source_table, NULL as interaction_type FROM matches WHERE matched_at >= CURRENT_DATE - INTERVAL '%d days'
			UNION ALL
			SELECT id, created_at, 'interactions' as source_table, interaction_type FROM user_interactions WHERE created_at >= CURRENT_DATE - INTERVAL '%d days'
		) combined
		GROUP BY DATE(created_at)
		ORDER BY date ASC
	`

	query := fmt.Sprintf(trendsQuery, days, days)
	if err := db.Raw(query).Scan(&trends).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to get match trends: "+err.Error())
		return
	}

	utils.RespondOK(c, gin.H{
		"trends": trends,
		"period_days": days,
	})
}
