package handlers

import (
	"math"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"user-service/src/conf"
	"user-service/src/models"
	"user-service/src/utils"
)

// SearchRequest represents search parameters
type SearchRequest struct {
	AgeMin       *int     `form:"age_min" json:"age_min"`
	AgeMax       *int     `form:"age_max" json:"age_max"`
	MaxDistance  *float64 `form:"max_distance" json:"max_distance"`
	FameMin      *int     `form:"fame_min" json:"fame_min"`
	Tags         []string `form:"tags" json:"tags"`
	Gender       *string  `form:"gender" json:"gender"`
	CurrentCity  *string  `form:"current_city" json:"current_city"`
	IsOnline     *bool    `form:"is_online" json:"is_online"`
	HasImages    *bool    `form:"has_images" json:"has_images"`
	Limit        *int     `form:"limit" json:"limit"`
	Offset       *int     `form:"offset" json:"offset"`
}

// SearchUsersHandler provides advanced user search functionality
func SearchUsersHandler(c *gin.Context) {
	// Get authenticated user ID
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	userID := authenticatedUserID.(uint)

	// Get current user location for distance calculations
	var currentUser models.User
	if err := conf.DB.First(&currentUser, userID).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to get current user")
		return
	}

	// Parse search parameters
	var req SearchRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid search parameters: "+err.Error())
		return
	}

	// Handle tags from form data (comma-separated)
	if tagsStr := c.Query("tags"); tagsStr != "" {
		req.Tags = strings.Split(tagsStr, ",")
		for i := range req.Tags {
			req.Tags[i] = strings.TrimSpace(req.Tags[i])
		}
	}

	// Set default limits
	if req.Limit == nil {
		defaultLimit := 20
		req.Limit = &defaultLimit
	}
	if req.Offset == nil {
		defaultOffset := 0
		req.Offset = &defaultOffset
	}

	// Build query
	query := conf.DB.Model(&models.User{}).
		Preload("Tags").
		Preload("Images", "is_active = ?", true).
		Where("id != ?", userID) // Exclude current user

	// Apply filters
	if req.AgeMin != nil {
		query = query.Where("age >= ?", *req.AgeMin)
	}
	if req.AgeMax != nil {
		query = query.Where("age <= ?", *req.AgeMax)
	}
	if req.FameMin != nil {
		query = query.Where("fame >= ?", *req.FameMin)
	}
	if req.Gender != nil {
		query = query.Where("gender = ?", *req.Gender)
	}
	if req.CurrentCity != nil {
		query = query.Where("current_city ILIKE ?", "%"+*req.CurrentCity+"%")
	}

	// Filter by tags if specified
	if len(req.Tags) > 0 {
		subQuery := conf.DB.Table("user_tags ut").
			Select("ut.user_id").
			Joins("JOIN tags t ON ut.tag_id = t.id").
			Where("t.name IN ?", req.Tags).
			Group("ut.user_id").
			Having("COUNT(DISTINCT t.id) = ?", len(req.Tags))
		query = query.Where("id IN (?)", subQuery)
	}

	// Filter by images if specified
	if req.HasImages != nil && *req.HasImages {
		subQuery := conf.DB.Table("images").
			Select("user_id").
			Where("is_active = ? AND user_id IS NOT NULL", true).
			Group("user_id")
		query = query.Where("id IN (?)", subQuery)
	}

	// Get total count before applying limit/offset
	var total int64
	if err := query.Count(&total).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to count users")
		return
	}

	// Apply pagination
	var users []models.User
	if err := query.Limit(*req.Limit).Offset(*req.Offset).Find(&users).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to search users")
		return
	}

	// Convert to public profiles with distance calculation
	var profiles []map[string]interface{}
	for _, user := range users {
		profile := user.ToPublicProfile()
		profileMap := map[string]interface{}{
			"profile": profile,
		}

		// Calculate distance if both users have location data
		if currentUser.Latitude.Valid && currentUser.Longitude.Valid && 
		   user.Latitude.Valid && user.Longitude.Valid {
			distance := calculateDistance(
				currentUser.Latitude.Float64, currentUser.Longitude.Float64,
				user.Latitude.Float64, user.Longitude.Float64,
			)
			profileMap["distance_km"] = math.Round(distance*100) / 100
		}

		profiles = append(profiles, profileMap)
	}

	// Filter by distance if specified and location data is available
	if req.MaxDistance != nil && currentUser.Latitude.Valid && currentUser.Longitude.Valid {
		var filteredProfiles []map[string]interface{}
		for _, profile := range profiles {
			if distance, ok := profile["distance_km"].(float64); ok {
				if distance <= *req.MaxDistance {
					filteredProfiles = append(filteredProfiles, profile)
				}
			}
		}
		profiles = filteredProfiles
		// Update total count for distance filtering
		total = int64(len(profiles))
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"users": profiles,
		"pagination": gin.H{
			"total":  total,
			"limit":  *req.Limit,
			"offset": *req.Offset,
		},
		"search_params": req,
	})
}

// calculateDistance calculates the distance between two geographic points using Haversine formula
// Returns distance in kilometers
func calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371 // Earth's radius in kilometers

	// Convert degrees to radians
	lat1Rad := lat1 * math.Pi / 180
	lon1Rad := lon1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	lon2Rad := lon2 * math.Pi / 180

	// Calculate differences
	dLat := lat2Rad - lat1Rad
	dLon := lon2Rad - lon1Rad

	// Haversine formula
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}