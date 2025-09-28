package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

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

	userID := uint(authenticatedUserID.(int))

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

// GetMatchedUsersHandler finds users that the current user has matched with and have location data
func GetMatchedUsersHandler(c *gin.Context) {
	// Get authenticated user ID
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	userID := uint(authenticatedUserID.(int))

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

	// Query to get matched users with their location data
	// We need to join with matches table to get only matched users
	var matchedUsers []models.User
	err := conf.DB.Preload("Tags").Preload("Images", "is_active = ?", true).
		Joins(`JOIN matches ON
			(matches.user1_id = ? AND matches.user2_id = users.id AND matches.is_active = true) OR
			(matches.user2_id = ? AND matches.user1_id = users.id AND matches.is_active = true)`, userID, userID).
		Where("users.latitude IS NOT NULL AND users.longitude IS NOT NULL").
		Find(&matchedUsers).Error

	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to get matched users")
		return
	}

	// Create results matching frontend interface
	matchedUsersList := make([]NearbyUserResponse, 0)
	for _, user := range matchedUsers {
		if !user.Latitude.Valid || !user.Longitude.Valid {
			continue
		}

		// Calculate distance for display purposes
		distance := utils.CalculateDistance(
			currentUser.Latitude.Float64, currentUser.Longitude.Float64,
			user.Latitude.Float64, user.Longitude.Float64,
		)

		matchedUser := NearbyUserResponse{
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
			matchedUser.CurrentCity = &user.CurrentCity.String
		}

		// Convert tags to string array
		for _, tag := range user.Tags {
			matchedUser.Tags = append(matchedUser.Tags, tag.Name)
		}

		// Convert images to URL array (only active images)
		for _, image := range user.Images {
			if image.IsActive {
				matchedUser.Images = append(matchedUser.Images, image.URL())
			}
		}

		// Add default image if none available
		if len(matchedUser.Images) == 0 {
			matchedUser.Images = append(matchedUser.Images, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop")
		}

		matchedUsersList = append(matchedUsersList, matchedUser)
	}

	// Response matching frontend NearbyUsersResponse interface
	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"users": matchedUsersList,
		"count": len(matchedUsersList),
		"center_location": gin.H{
			"latitude":  currentUser.Latitude.Float64,
			"longitude": currentUser.Longitude.Float64,
		},
		"matches_only": true, // Indicate this is matches-only mode
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

	userID := uint(authenticatedUserID.(int))

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

// ReverseGeocodeHandler performs reverse geocoding using external API
func ReverseGeocodeHandler(c *gin.Context) {
	lat := c.Query("lat")
	lon := c.Query("lon")

	if lat == "" || lon == "" {
		utils.RespondError(c, http.StatusBadRequest, "latitude and longitude are required")
		return
	}

	// Make request to OpenStreetMap Nominatim API
	url := fmt.Sprintf("https://nominatim.openstreetmap.org/reverse?format=json&lat=%s&lon=%s&zoom=18&addressdetails=1", lat, lon)
	
	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to create request")
		return
	}
	
	req.Header.Set("User-Agent", "Matcha-App/1.0")
	
	resp, err := client.Do(req)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to perform geocoding")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		utils.RespondError(c, http.StatusServiceUnavailable, "geocoding service unavailable")
		return
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to parse geocoding response")
		return
	}

	// Extract city and country from response
	response := gin.H{}
	
	if address, ok := result["address"].(map[string]interface{}); ok {
		// Try different city field names
		if city, exists := address["city"]; exists {
			response["city"] = city
		} else if town, exists := address["town"]; exists {
			response["city"] = town
		} else if village, exists := address["village"]; exists {
			response["city"] = village
		}
		
		if country, exists := address["country"]; exists {
			response["country"] = country
		}
	}

	utils.RespondSuccess(c, http.StatusOK, response)
}

