package handlers

import (
	"log"
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

	log.Printf("🔍 [DEBUG] Matching request - UserID: %d, Algorithm: %s, Limit: %d, MaxDistance: %v, AgeRange: %v",
		userID, algorithmType, limit, maxDistance, ageRange)

	matchService := services.NewMatchService()

	// Check if client wants only candidate IDs (default behavior now)
	fullProfiles := c.DefaultQuery("full_profiles", "false") == "true"
	log.Printf("🔍 [DEBUG] Full profiles requested: %t", fullProfiles)

	if fullProfiles {
		// Return full profile data (legacy behavior)
		matches, err := matchService.RunMatchingAlgorithm(userID, algorithmType, limit, maxDistance, ageRange)
		if err != nil {
			log.Printf("❌ [ERROR] Full profile matching failed: %v", err)
			utils.RespondError(c, "Failed to run matching algorithm: "+err.Error(), http.StatusInternalServerError)
			return
		}

		log.Printf("✅ [DEBUG] Full profiles found: %d matches", len(matches))
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
			log.Printf("❌ [ERROR] Candidate matching failed: %v", err)
			utils.RespondError(c, "Failed to run matching algorithm: "+err.Error(), http.StatusInternalServerError)
			return
		}

		log.Printf("✅ [DEBUG] Candidates found: %d candidates", len(candidates))
		if len(candidates) > 0 {
			log.Printf("🔍 [DEBUG] First few candidates: %+v", candidates[:min(3, len(candidates))])
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