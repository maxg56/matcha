package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"match-service/src/services"
	"match-service/src/utils"
)

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