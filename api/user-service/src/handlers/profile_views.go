package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"user-service/src/services"
	"user-service/src/utils"
)

// TrackProfileViewHandler tracks when a user views another user's profile
func TrackProfileViewHandler(c *gin.Context) {
	viewedIDParam := c.Param("id")

	viewedID, err := strconv.ParseUint(viewedIDParam, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	// Get authenticated user ID
	viewerID, err := utils.GetAuthenticatedUserID(c)
	if err != nil {
		return // Error already handled by helper
	}

	// Track profile view using service
	service := services.NewProfileViewService()
	tracked, err := service.TrackProfileView(viewerID, uint(viewedID))
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			utils.RespondError(c, appErr.StatusCode, appErr.Message)
		} else {
			utils.RespondError(c, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message":   "Profile view tracked successfully",
		"viewed_id": viewedID,
		"tracked":   tracked,
	})
}

// GetProfileViewersHandler gets users who viewed the authenticated user's profile
func GetProfileViewersHandler(c *gin.Context) {
	// Get authenticated user ID
	userID, err := utils.GetAuthenticatedUserID(c)
	if err != nil {
		return // Error already handled by helper
	}

	// Parse pagination parameters
	paginationParams := utils.ParsePaginationParams(c)

	// Get profile viewers using service
	service := services.NewProfileViewService()
	profileViews, total, err := service.GetProfileViewers(userID, paginationParams)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			utils.RespondError(c, appErr.StatusCode, appErr.Message)
		} else {
			utils.RespondError(c, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	// Format response
	viewers := utils.FormatProfileViewersLegacy(profileViews)
	pagination := utils.NewPagination(total, paginationParams.Limit, paginationParams.Offset)

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"viewers":    viewers,
		"pagination": pagination,
	})
}

// GetProfileViewStatsHandler gets profile view statistics for the authenticated user
func GetProfileViewStatsHandler(c *gin.Context) {
	// Get authenticated user ID
	userID, err := utils.GetAuthenticatedUserID(c)
	if err != nil {
		return // Error already handled by helper
	}

	// Get stats using service
	service := services.NewProfileViewService()
	stats, err := service.GetProfileViewStats(userID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to get profile view stats")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"stats": stats,
	})
}

// GetMyProfileViewsHandler gets profiles that the authenticated user has viewed
func GetMyProfileViewsHandler(c *gin.Context) {
	// Get authenticated user ID
	userID, err := utils.GetAuthenticatedUserID(c)
	if err != nil {
		return // Error already handled by helper
	}

	// Parse pagination parameters
	paginationParams := utils.ParsePaginationParams(c)

	// Get viewed profiles using service
	service := services.NewProfileViewService()
	profileViews, total, err := service.GetViewedProfiles(userID, paginationParams)
	if err != nil {
		if appErr, ok := err.(*utils.AppError); ok {
			utils.RespondError(c, appErr.StatusCode, appErr.Message)
		} else {
			utils.RespondError(c, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	// Format response
	viewedProfiles := utils.FormatViewedProfilesLegacy(profileViews)
	pagination := utils.NewPagination(total, paginationParams.Limit, paginationParams.Offset)

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"viewed_profiles": viewedProfiles,
		"pagination":      pagination,
	})
}