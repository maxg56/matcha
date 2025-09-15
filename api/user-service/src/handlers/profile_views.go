package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"user-service/src/conf"
	"user-service/src/models"
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
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	viewerID := uint(authenticatedUserID.(int))

	// Users cannot track viewing their own profile
	if uint(viewedID) == viewerID {
		utils.RespondError(c, http.StatusBadRequest, "cannot track viewing your own profile")
		return
	}

	// Check if viewed user exists
	var viewedUser models.User
	if err := conf.DB.First(&viewedUser, viewedID).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "user not found")
		return
	}

	// Check if this view was already recorded in the last hour to avoid spam
	oneHourAgo := time.Now().Add(-time.Hour)
	var existingView models.ProfileView
	recentView := conf.DB.Where("viewer_id = ? AND viewed_id = ? AND created_at > ?", 
		viewerID, viewedID, oneHourAgo).First(&existingView).Error == nil

	if !recentView {
		// Create new profile view record
		profileView := models.ProfileView{
			ViewerID: viewerID,
			ViewedID: uint(viewedID),
		}

		if err := conf.DB.Create(&profileView).Error; err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "failed to track profile view")
			return
		}
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message":    "Profile view tracked successfully",
		"viewed_id":  viewedID,
		"tracked":    !recentView, // Only true if a new record was created
	})
}

// GetProfileViewersHandler gets users who viewed the authenticated user's profile
func GetProfileViewersHandler(c *gin.Context) {
	// Get authenticated user ID
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	userID := uint(authenticatedUserID.(int))

	// Parse limit parameter
	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	// Parse offset parameter
	offsetStr := c.DefaultQuery("offset", "0")
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Get profile views with viewer information
	var profileViews []models.ProfileView
	if err := conf.DB.Preload("Viewer").
		Where("viewed_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&profileViews).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to get profile viewers")
		return
	}

	// Get total count
	var total int64
	conf.DB.Model(&models.ProfileView{}).Where("viewed_id = ?", userID).Count(&total)

	// Format response with viewer profiles
	var viewers []gin.H
	for _, view := range profileViews {
		viewers = append(viewers, gin.H{
			"viewer": gin.H{
				"id":         view.Viewer.ID,
				"username":   view.Viewer.Username,
				"first_name": view.Viewer.FirstName,
				"age":        view.Viewer.Age,
				"fame":       view.Viewer.Fame,
			},
			"viewed_at": view.CreatedAt,
		})
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"viewers": viewers,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GetProfileViewStatsHandler gets profile view statistics for the authenticated user
func GetProfileViewStatsHandler(c *gin.Context) {
	// Get authenticated user ID
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	userID := uint(authenticatedUserID.(int))

	// Get total views
	var totalViews int64
	conf.DB.Model(&models.ProfileView{}).Where("viewed_id = ?", userID).Count(&totalViews)

	// Get unique viewers count
	var uniqueViewers int64
	conf.DB.Model(&models.ProfileView{}).
		Select("DISTINCT viewer_id").
		Where("viewed_id = ?", userID).
		Count(&uniqueViewers)

	// Get views in the last 7 days
	weekAgo := time.Now().AddDate(0, 0, -7)
	var weeklyViews int64
	conf.DB.Model(&models.ProfileView{}).
		Where("viewed_id = ? AND created_at > ?", userID, weekAgo).
		Count(&weeklyViews)

	// Get views in the last 24 hours
	dayAgo := time.Now().AddDate(0, 0, -1)
	var dailyViews int64
	conf.DB.Model(&models.ProfileView{}).
		Where("viewed_id = ? AND created_at > ?", userID, dayAgo).
		Count(&dailyViews)

	// Get last view date
	var lastView models.ProfileView
	lastViewExists := conf.DB.Where("viewed_id = ?", userID).
		Order("created_at DESC").
		First(&lastView).Error == nil

	var lastViewedAt *time.Time
	if lastViewExists {
		lastViewedAt = &lastView.CreatedAt
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"stats": gin.H{
			"total_views":    totalViews,
			"unique_viewers": uniqueViewers,
			"weekly_views":   weeklyViews,
			"daily_views":    dailyViews,
			"last_viewed_at": lastViewedAt,
		},
	})
}

// GetMyProfileViewsHandler gets profiles that the authenticated user has viewed
func GetMyProfileViewsHandler(c *gin.Context) {
	// Get authenticated user ID
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	userID := uint(authenticatedUserID.(int))

	// Parse limit parameter
	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	// Parse offset parameter
	offsetStr := c.DefaultQuery("offset", "0")
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Get profiles viewed by the user
	var profileViews []models.ProfileView
	if err := conf.DB.Preload("Viewed").
		Where("viewer_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&profileViews).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to get viewed profiles")
		return
	}

	// Get total count
	var total int64
	conf.DB.Model(&models.ProfileView{}).Where("viewer_id = ?", userID).Count(&total)

	// Format response with viewed profiles
	var viewedProfiles []gin.H
	for _, view := range profileViews {
		viewedProfiles = append(viewedProfiles, gin.H{
			"profile": gin.H{
				"id":         view.Viewed.ID,
				"username":   view.Viewed.Username,
				"first_name": view.Viewed.FirstName,
				"age":        view.Viewed.Age,
				"fame":       view.Viewed.Fame,
			},
			"viewed_at": view.CreatedAt,
		})
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"viewed_profiles": viewedProfiles,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}