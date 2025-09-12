package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"user-service/src/conf"
	"user-service/src/models"
	"user-service/src/utils"
)

// LocationUpdateRequest represents location update payload
type LocationUpdateRequest struct {
	Latitude  float64 `json:"latitude" binding:"required,min=-90,max=90"`
	Longitude float64 `json:"longitude" binding:"required,min=-180,max=180"`
}

// UpdateLocationHandler updates user's current location
func UpdateLocationHandler(c *gin.Context) {
	userIDParam := c.Param("id")

	id, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	// Get authenticated user ID from JWT middleware
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	// Users can only update their own location
	if uint(id) != authenticatedUserID.(uint) {
		utils.RespondError(c, http.StatusForbidden, "cannot update another user's location")
		return
	}

	var req LocationUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid location data: "+err.Error())
		return
	}

	var user models.User
	if err := conf.DB.First(&user, id).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "user not found")
		return
	}

	// Update location
	user.Latitude.Float64 = req.Latitude
	user.Latitude.Valid = true
	user.Longitude.Float64 = req.Longitude
	user.Longitude.Valid = true

	if err := conf.DB.Save(&user).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to update location")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message":   "Location updated successfully",
		"latitude":  user.Latitude.Float64,
		"longitude": user.Longitude.Float64,
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

	// Filter by distance and create results
	var nearbyUsers []map[string]interface{}
	for _, user := range users {
		if !user.Latitude.Valid || !user.Longitude.Valid {
			continue
		}

		distance := calculateDistance(
			currentUser.Latitude.Float64, currentUser.Longitude.Float64,
			user.Latitude.Float64, user.Longitude.Float64,
		)

		if distance <= radius {
			profile := user.ToPublicProfile()
			nearbyUsers = append(nearbyUsers, map[string]interface{}{
				"profile":     profile,
				"distance_km": distance,
			})
		}

		// Limit results
		if len(nearbyUsers) >= limit {
			break
		}
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"users":       nearbyUsers,
		"radius_km":   radius,
		"total_found": len(nearbyUsers),
		"user_location": gin.H{
			"latitude":  currentUser.Latitude.Float64,
			"longitude": currentUser.Longitude.Float64,
		},
	})
}