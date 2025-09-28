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

// SearchRequest represents search parameters - enhanced for location search
type SearchRequest struct {
	AgeMin       *int     `form:"age_min" json:"age_min"`
	AgeMax       *int     `form:"age_max" json:"age_max"`
	MaxDistance  *float64 `form:"max_distance" json:"max_distance"`
	FameMin      *int     `form:"fame_min" json:"fame_min"`
	Tags         []string `form:"tags" json:"tags"`
	Gender       *string  `form:"gender" json:"gender"`
	CurrentCity  *string  `form:"current_city" json:"current_city"`
	City         *string  `form:"city" json:"city"` // Frontend uses 'city' parameter
	IsOnline     *bool    `form:"is_online" json:"is_online"`
	HasImages    *bool    `form:"has_images" json:"has_images"`
	Limit        *int     `form:"limit" json:"limit"`
	Offset       *int     `form:"offset" json:"offset"`
	Latitude     *float64 `form:"latitude" json:"latitude"`   // For coordinate-based search
	Longitude    *float64 `form:"longitude" json:"longitude"` // For coordinate-based search
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
	// Handle both current_city and city parameters
	if req.CurrentCity != nil {
		query = query.Where("current_city ILIKE ?", "%"+*req.CurrentCity+"%")
	}
	if req.City != nil {
		query = query.Where("current_city ILIKE ?", "%"+*req.City+"%")
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

	// Determine search center coordinates (use request coordinates or current user location)
	var searchLat, searchLng float64
	var hasSearchLocation bool

	if req.Latitude != nil && req.Longitude != nil {
		searchLat = *req.Latitude
		searchLng = *req.Longitude
		hasSearchLocation = true
	} else if currentUser.Latitude.Valid && currentUser.Longitude.Valid {
		searchLat = currentUser.Latitude.Float64
		searchLng = currentUser.Longitude.Float64
		hasSearchLocation = true
	}

	// Convert to NearbyUserResponse structure matching frontend interface
	nearbyUsers := make([]NearbyUserResponse, 0) // Initialize empty slice instead of nil
	for _, user := range users {
		nearbyUser := NearbyUserResponse{
			ID:        user.ID,
			Username:  user.Username,
			FirstName: user.FirstName,
			Age:       user.Age,
			Bio:       user.Bio,
		}

		// Add location data if available
		if user.Latitude.Valid && user.Longitude.Valid {
			nearbyUser.Latitude = user.Latitude.Float64
			nearbyUser.Longitude = user.Longitude.Float64

			// Calculate distance if search location is available
			if hasSearchLocation {
				distance := utils.CalculateDistance(
					searchLat, searchLng,
					user.Latitude.Float64, user.Longitude.Float64,
				)
				nearbyUser.Distance = math.Round(distance*100) / 100
			}
		}

		// Add city if available
		if user.CurrentCity.Valid {
			nearbyUser.CurrentCity = &user.CurrentCity.String
		}

		// Convert tags to string array
		for _, tag := range user.Tags {
			nearbyUser.Tags = append(nearbyUser.Tags, tag.Name)
		}

		// Convert images to URL array (only active images)
		for _, image := range user.Images {
			if image.IsActive {
				nearbyUser.Images = append(nearbyUser.Images, image.URL())
			}
		}

		// Add default image if none available
		if len(nearbyUser.Images) == 0 {
			nearbyUser.Images = append(nearbyUser.Images, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop")
		}

		nearbyUsers = append(nearbyUsers, nearbyUser)
	}

	// Filter by distance if specified
	if req.MaxDistance != nil && hasSearchLocation {
		filteredUsers := make([]NearbyUserResponse, 0) // Initialize empty slice
		for _, user := range nearbyUsers {
			if user.Distance <= *req.MaxDistance {
				filteredUsers = append(filteredUsers, user)
			}
		}
		nearbyUsers = filteredUsers
		total = int64(len(nearbyUsers))
	}

	// Create filters_applied structure for frontend
	filtersApplied := SearchRequest{
		AgeMin:      req.AgeMin,
		AgeMax:      req.AgeMax,
		MaxDistance: req.MaxDistance,
		Limit:       req.Limit,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
		City:        req.City,
	}

	// Response matching frontend SearchResponse interface
	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"users":          nearbyUsers,
		"count":          len(nearbyUsers),
		"filters_applied": filtersApplied,
	})
}

