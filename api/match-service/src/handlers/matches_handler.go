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

	log.Printf("🔍 [DEBUG UnmatchHandler] User %d requesting unmatch with user %d", userID, req.TargetUserID)

	// Use the interaction manager to handle the unmatch
	interactionManager := services.NewInteractionManager()
	err := interactionManager.UnmatchUsers(userID, req.TargetUserID)
	if err != nil {
		log.Printf("❌ [ERROR UnmatchHandler] Failed to unmatch users %d and %d: %v", userID, req.TargetUserID, err)
		utils.RespondError(c, "Failed to unmatch: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("✅ [SUCCESS UnmatchHandler] Successfully unmatched users %d and %d", userID, req.TargetUserID)

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message":        "Successfully unmatched",
		"user_id":        userID,
		"target_user_id": req.TargetUserID,
	})
}

// GetReceivedLikesHandler returns likes received by the user (Premium feature)
func GetReceivedLikesHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	// TODO: Check if user has Premium subscription
	// isPremium := checkPremiumStatus(userID)
	// if !isPremium {
	//     utils.RespondError(c, "Premium subscription required", http.StatusForbidden)
	//     return
	// }

	matchService := services.NewMatchService()
	receivedLikes, err := matchService.GetReceivedLikes(userID)
	if err != nil {
		utils.RespondError(c, "Failed to get received likes: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, receivedLikes)
}

// GetReceivedLikesPreviewHandler returns limited preview of received likes for free users
func GetReceivedLikesPreviewHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	// Parse limit parameter (default 3 for free users)
	limit := 3
	if limitStr := c.Query("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	matchService := services.NewMatchService()
	previewLikes, err := matchService.GetReceivedLikesPreview(userID, limit)
	if err != nil {
		utils.RespondError(c, "Failed to get received likes preview: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, previewLikes)
}

// GetLikeStatsHandler returns like statistics for the user
func GetLikeStatsHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	matchService := services.NewMatchService()
	stats, err := matchService.GetLikeStats(userID)
	if err != nil {
		utils.RespondError(c, "Failed to get like stats: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, stats)
}

// GetRewindAvailabilityHandler checks if user can rewind their last action
func GetRewindAvailabilityHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	rewindService := services.NewRewindService()
	availability, err := rewindService.GetRewindAvailability(userID)
	if err != nil {
		utils.RespondError(c, "Failed to check rewind availability: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, availability)
}

// PerformRewindHandler executes the rewind action
func PerformRewindHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	rewindService := services.NewRewindService()
	err := rewindService.PerformRewind(userID)
	if err != nil {
		utils.RespondError(c, "Failed to perform rewind: "+err.Error(), http.StatusBadRequest)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "Rewind performed successfully",
		"user_id": userID,
	})
}