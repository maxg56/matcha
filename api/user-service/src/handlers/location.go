package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"user-service/src/conf"
	"user-service/src/models"
	"user-service/src/utils"
)


// UpdateLocationHandler updates user's current location
func UpdateLocationHandler(c *gin.Context) {
	// Get authenticated user ID from JWT middleware
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	userID := authenticatedUserID.(uint)

	var req LocationUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid location data: "+err.Error())
		return
	}

	var user models.User
	if err := conf.DB.First(&user, userID).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "user not found")
		return
	}

	// Update location
	user.Latitude.Float64 = req.Latitude
	user.Latitude.Valid = true
	user.Longitude.Float64 = req.Longitude
	user.Longitude.Valid = true

	// Update city and country if provided
	if req.City != nil {
		user.CurrentCity.String = *req.City
		user.CurrentCity.Valid = true
	}

	if err := conf.DB.Save(&user).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to update location")
		return
	}

	// Create response matching frontend interface
	locationResp := UserLocation{
		ID:        user.ID,
		UserID:    user.ID,
		Latitude:  user.Latitude.Float64,
		Longitude: user.Longitude.Float64,
		UpdatedAt: user.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	if user.CurrentCity.Valid {
		locationResp.City = &user.CurrentCity.String
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"success":  true,
		"location": locationResp,
		"message":  "Location updated successfully",
	})
}

// GetNearbyUsersHandler finds users within a specified radius
func GetNearbyUsersHandler(c *gin.Context) {
	// Get authenticated user ID
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	userID := authenticatedUserID.(uint)

	// Get current user location
	var currentUser models.User
	if err := conf.DB.First(&currentUser, userID).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to get current user")
		return
	}

	if !currentUser.Latitude.Valid || !currentUser.Longitude.Valid {
		utils.RespondError(c, http.StatusBadRequest, "current user location not set")
		return
	}

	// Parse radius parameter (default 50km)
	radiusStr := c.DefaultQuery("radius", "50")
	radius, err := strconv.ParseFloat(radiusStr, 64)
	if err != nil || radius <= 0 {
		utils.RespondError(c, http.StatusBadRequest, "invalid radius parameter")
		return
	}

	// Parse limit parameter (default 20)
	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	// Get all users with location data (excluding current user)
	var users []models.User
	if err := conf.DB.Preload("Tags").Preload("Images", "is_active = ?", true).
		Where("id != ? AND latitude IS NOT NULL AND longitude IS NOT NULL", userID).
		Find(&users).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to get users")
		return
	}

	// Filter by distance and create results matching frontend interface
	nearbyUsers := make([]NearbyUserResponse, 0) // Initialize empty slice instead of nil
	for _, user := range users {
		if !user.Latitude.Valid || !user.Longitude.Valid {
			continue
		}

		distance := utils.CalculateDistance(
			currentUser.Latitude.Float64, currentUser.Longitude.Float64,
			user.Latitude.Float64, user.Longitude.Float64,
		)

		if distance <= radius {
			nearbyUser := NearbyUserResponse{
				ID:        user.ID,
				Username:  user.Username,
				FirstName: user.FirstName,
				Age:       user.Age,
				Bio:       user.Bio,
				Latitude:  user.Latitude.Float64,
				Longitude: user.Longitude.Float64,
				Distance:  distance,
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

		// Limit results
		if len(nearbyUsers) >= limit {
			break
		}
	}

	// Response matching frontend NearbyUsersResponse interface
	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"users": nearbyUsers,
		"count": len(nearbyUsers),
		"center_location": gin.H{
			"latitude":  currentUser.Latitude.Float64,
			"longitude": currentUser.Longitude.Float64,
		},
		"search_radius": radius,
	})
}

// GetCurrentLocationHandler returns the current user's location
func GetCurrentLocationHandler(c *gin.Context) {
	// Get authenticated user ID
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	userID := authenticatedUserID.(uint)

	// Get current user
	var user models.User
	if err := conf.DB.First(&user, userID).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "user not found")
		return
	}

	// Check if location is set
	if !user.Latitude.Valid || !user.Longitude.Valid {
		utils.RespondError(c, http.StatusNotFound, "user location not set")
		return
	}

	// Create response matching frontend interface
	locationResp := UserLocation{
		ID:        user.ID,
		UserID:    user.ID,
		Latitude:  user.Latitude.Float64,
		Longitude: user.Longitude.Float64,
		UpdatedAt: user.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	if user.CurrentCity.Valid {
		locationResp.City = &user.CurrentCity.String
	}

	utils.RespondSuccess(c, http.StatusOK, locationResp)
}

