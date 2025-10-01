package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"match-service/src/services"
	"match-service/src/utils"
)

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// GetMatchesHandler returns matches for a user
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

// MatchingAlgorithmHandler runs the matching algorithm for a user
func MatchingAlgorithmHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	// Retrieve user preferences from the preferences service
	preferencesManager := services.NewUserPreferencesManager()
	userPreferences, err := preferencesManager.GetUserMatchingPreferences(userID)
	if err != nil {
		utils.RespondError(c, "Failed to get user preferences: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Parse query parameters with user preferences as defaults
	limit := 20

	if limitStr := c.Query("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil {
			if parsedLimit > 0 && parsedLimit <= 50 {
				limit = parsedLimit
			}
		}
	}

	// Use user's preferred max distance as default, allow override via query param
	var maxDistance *int
	defaultMaxDistance := int(userPreferences.MaxDistance) // Convert float64 to int
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
		// Note: Profiles are no longer marked as seen here - they will be marked when user actually interacts

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
		// Note: Profiles are no longer marked as seen here - they will be marked when user actually interacts

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

// UnmatchHandler handles unmatch requests between users
func UnmatchHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	type UnmatchRequest struct {
		TargetUserID int `json:"target_user_id" binding:"required"`
	}

	var req UnmatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, "Invalid request: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate that user is not trying to unmatch themselves
	if userID == req.TargetUserID {
		utils.RespondError(c, "Cannot unmatch yourself", http.StatusBadRequest)
		return
	}
	
	// Use the interaction manager to handle the unmatch
	interactionManager := services.NewInteractionManager()
	err := interactionManager.UnmatchUsers(userID, req.TargetUserID)
	if err != nil {
		utils.RespondError(c, "Failed to unmatch: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message":        "Successfully unmatched",
		"user_id":        userID,
		"target_user_id": req.TargetUserID,
	})
}

// TestUnmatchHandler handles unmatch requests for testing (no auth required)
func TestUnmatchHandler(c *gin.Context) {
	// Get user ID from header for testing
	userIDStr := c.GetHeader("user_id")
	if userIDStr == "" {
		utils.RespondError(c, "Missing user_id header", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.RespondError(c, "Invalid user_id format", http.StatusBadRequest)
		return
	}

	type UnmatchRequest struct {
		TargetUserID int `json:"target_user_id" binding:"required"`
	}

	var req UnmatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, "Invalid request: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate that user is not trying to unmatch themselves
	if userID == req.TargetUserID {
		utils.RespondError(c, "Cannot unmatch yourself", http.StatusBadRequest)
		return
	}

	// Use the interaction manager to handle the unmatch
	interactionManager := services.NewInteractionManager()
	err = interactionManager.UnmatchUsers(userID, req.TargetUserID)
	if err != nil {
		utils.RespondError(c, "Failed to unmatch: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message":        "Successfully unmatched (test mode)",
		"user_id":        userID,
		"target_user_id": req.TargetUserID,
	})
}