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
	
	// Parse query parameters
	limit := 20
	if limitStr := c.Query("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil {
			if parsedLimit > 0 && parsedLimit <= 50 {
				limit = parsedLimit
			}
		}
	}

	var maxDistance *int
	if distanceStr := c.Query("max_distance"); distanceStr != "" {
		if parsedDistance, err := strconv.Atoi(distanceStr); err == nil && parsedDistance > 0 {
			maxDistance = &parsedDistance
		}
	}

	var ageRange *services.AgeRange
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
	matches, err := matchService.RunMatchingAlgorithm(userID, algorithmType, limit, maxDistance, ageRange)
	if err != nil {
		utils.RespondError(c, "Failed to run matching algorithm: "+err.Error(), http.StatusInternalServerError)
		return
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
}