package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"match-service/src/services"
	"match-service/src/utils"
)

// LikeUserHandler handles user like interactions
func LikeUserHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	var request struct {
		TargetUserID int `json:"target_user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}

	if request.TargetUserID == userID {
		utils.RespondError(c, http.StatusBadRequest, "Cannot like yourself")
		return
	}

	// Use match service for handling likes
	matchService := services.NewMatchService()
	result, err := matchService.LikeUser(userID, request.TargetUserID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to like user: "+err.Error())
		return
	}

	// Mark this profile as seen since user interacted with it
	userService := services.NewUserService()
	userService.MarkProfilesAsSeen(userID, []int{request.TargetUserID}, "user_interaction")

	utils.RespondSuccess(c, http.StatusOK, result)
}

// UnlikeUserHandler handles user unlike interactions
func UnlikeUserHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	var request struct {
		TargetUserID int `json:"target_user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}

	if request.TargetUserID == userID {
		utils.RespondError(c, http.StatusBadRequest, "Cannot unlike yourself")
		return
	}

	// Use match service for handling unlikes
	matchService := services.NewMatchService()
	result, err := matchService.UnlikeUser(userID, request.TargetUserID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to unlike user: "+err.Error())
		return
	}

	// Mark this profile as seen since user interacted with it
	userService := services.NewUserService()
	userService.MarkProfilesAsSeen(userID, []int{request.TargetUserID}, "user_interaction")

	utils.RespondSuccess(c, http.StatusOK, result)
}

// BlockUserHandler handles user block interactions
func BlockUserHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	var request struct {
		TargetUserID int `json:"target_user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}

	if request.TargetUserID == userID {
		utils.RespondError(c, http.StatusBadRequest, "Cannot block yourself")
		return
	}

	// Use match service for handling blocks
	matchService := services.NewMatchService()
	result, err := matchService.BlockUser(userID, request.TargetUserID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to block user: "+err.Error())
		return
	}

	// Mark this profile as seen since user interacted with it
	userService := services.NewUserService()
	userService.MarkProfilesAsSeen(userID, []int{request.TargetUserID}, "user_interaction")

	utils.RespondSuccess(c, http.StatusOK, result)
}