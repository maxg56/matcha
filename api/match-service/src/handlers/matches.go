package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"match-service/src/services"
	"match-service/src/utils"
)

func GetMatchesHandler(c *gin.Context) {
	userID := c.GetInt("userID")
	
	matchService := services.NewMatchService()
	matches, err := matchService.GetUserMatches(userID)
	if err != nil {
		utils.RespondError(c, "Failed to get matches: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"matches": matches,
		"count":   len(matches),
		"user_id": userID,
	})
}

func LikeUserHandler(c *gin.Context) {
	userID := c.GetInt("userID")
	
	var request struct {
		TargetUserID int `json:"target_user_id" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.RespondError(c, "Invalid request: "+err.Error(), http.StatusBadRequest)
		return
	}

	if request.TargetUserID == userID {
		utils.RespondError(c, "Cannot like yourself", http.StatusBadRequest)
		return
	}

	// Use match service for handling likes
	matchService := services.NewMatchService()
	result, err := matchService.LikeUser(userID, request.TargetUserID)
	if err != nil {
		utils.RespondError(c, "Failed to like user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, result)
}

func UnlikeUserHandler(c *gin.Context) {
	userID := c.GetInt("userID")
	
	var request struct {
		TargetUserID int `json:"target_user_id" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.RespondError(c, "Invalid request: "+err.Error(), http.StatusBadRequest)
		return
	}

	if request.TargetUserID == userID {
		utils.RespondError(c, "Cannot unlike yourself", http.StatusBadRequest)
		return
	}

	// Use match service for handling unlikes
	matchService := services.NewMatchService()
	result, err := matchService.UnlikeUser(userID, request.TargetUserID)
	if err != nil {
		utils.RespondError(c, "Failed to unlike user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, result)
}

func BlockUserHandler(c *gin.Context) {
	userID := c.GetInt("userID")
	
	var request struct {
		TargetUserID int `json:"target_user_id" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.RespondError(c, "Invalid request: "+err.Error(), http.StatusBadRequest)
		return
	}

	if request.TargetUserID == userID {
		utils.RespondError(c, "Cannot block yourself", http.StatusBadRequest)
		return
	}

	// Use match service for handling blocks
	matchService := services.NewMatchService()
	result, err := matchService.BlockUser(userID, request.TargetUserID)
	if err != nil {
		utils.RespondError(c, "Failed to block user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, result)
}

func MatchingAlgorithmHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	// For now, we'll use default preferences since the method is not available
	// TODO: Implement proper preference retrieval from the preferences service
	userPreferences := struct {
		AgeMin      int
		AgeMax      int
		MaxDistance int
		MinFame     int
	}{
		AgeMin:      18,
		AgeMax:      99,
		MaxDistance: 50,
		MinFame:     0,
	}

	// Parse query parameters with user preferences as defaults
	limit := 20

	// Initialize services we'll need
	userService := services.NewUserService()
	if limitStr := c.Query("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil {
			if parsedLimit > 0 && parsedLimit <= 50 {
				limit = parsedLimit
			}
		}
	}

	// Use user's preferred max distance as default, allow override via query param
	var maxDistance *int
	defaultMaxDistance := int(userPreferences.MaxDistance)
	maxDistance = &defaultMaxDistance
	if distanceStr := c.Query("max_distance"); distanceStr != "" {
		if parsedDistance, err := strconv.Atoi(distanceStr); err == nil && parsedDistance > 0 {
			maxDistance = &parsedDistance
		}
	}

	// Use user's preferred age range as default, allow override via query params
	var ageRange *services.AgeRange
	defaultAgeRange := &services.AgeRange{Min: userPreferences.AgeMin, Max: userPreferences.AgeMax}
	ageRange = defaultAgeRange

	ageMinStr := c.Query("age_min")
	ageMaxStr := c.Query("age_max")
	if ageMinStr != "" && ageMaxStr != "" {
		if ageMin, err1 := strconv.Atoi(ageMinStr); err1 == nil {
			if ageMax, err2 := strconv.Atoi(ageMaxStr); err2 == nil && ageMin <= ageMax {
				ageRange = &services.AgeRange{Min: ageMin, Max: ageMax}
			}
		}
	}

	algorithmType := c.DefaultQuery("algorithm_type", "vector_based")

	matchService := services.NewMatchService()

	// Check if client wants only candidate IDs (default behavior now)
	fullProfiles := c.DefaultQuery("full_profiles", "false") == "true"

	if fullProfiles {
		// Return full profile data (legacy behavior)
		matches, err := matchService.RunMatchingAlgorithm(userID, algorithmType, limit, maxDistance, ageRange)
		if err != nil {
			utils.RespondError(c, "Failed to run matching algorithm: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Mark these profiles as seen
		var seenUserIDs []int
		for _, match := range matches {
			seenUserIDs = append(seenUserIDs, match.ID)
		}
		if len(seenUserIDs) > 0 {
			if err := userService.MarkProfilesAsSeen(userID, seenUserIDs, algorithmType); err != nil {
				// Log error but don't fail the request
				utils.RespondError(c, "Warning: Failed to mark profiles as seen: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}

		utils.RespondSuccess(c, http.StatusOK, gin.H{
			"matches":        matches,
			"count":          len(matches),
			"algorithm_type": algorithmType,
			"parameters": gin.H{
				"limit":        limit,
				"max_distance": maxDistance,
				"age_range":    ageRange,
			},
		})
	} else {
		// Return only candidate IDs with scores (new default behavior)
		candidates, err := matchService.GetMatchingCandidates(userID, algorithmType, limit, maxDistance, ageRange)
		if err != nil {
			utils.RespondError(c, "Failed to run matching algorithm: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Mark these profiles as seen
		var seenUserIDs []int
		for _, candidate := range candidates {
			seenUserIDs = append(seenUserIDs, candidate.ID)
		}
		if len(seenUserIDs) > 0 {
			if err := userService.MarkProfilesAsSeen(userID, seenUserIDs, algorithmType); err != nil {
				// Log error but don't fail the request
				utils.RespondError(c, "Warning: Failed to mark profiles as seen: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}

		utils.RespondSuccess(c, http.StatusOK, gin.H{
			"candidates":     candidates,
			"count":          len(candidates),
			"algorithm_type": algorithmType,
			"parameters": gin.H{
				"limit":        limit,
				"max_distance": maxDistance,
				"age_range":    ageRange,
			},
		})
	}
}

// GetUserPreferencesHandler returns the learned preferences for a user
func GetUserPreferencesHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	vectorService := services.NewVectorMatchingService()
	preferences, err := vectorService.GetUserPreferences(userID)
	if err != nil {
		utils.RespondError(c, "Failed to get user preferences: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"user_id":     userID,
		"preferences": preferences,
	})
}

// ResetSeenProfilesHandler allows a user to reset their seen profiles (for development/testing)
func ResetSeenProfilesHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	userService := services.NewUserService()
	err := userService.ResetSeenProfiles(userID)
	if err != nil {
		utils.RespondError(c, "Failed to reset seen profiles: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message":  "Seen profiles reset successfully",
		"user_id":  userID,
	})
}