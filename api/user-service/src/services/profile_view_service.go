package services

import (
	"time"

	"user-service/src/conf"
	"user-service/src/models"
	"user-service/src/utils"
)

// ProfileViewService handles profile view operations
type ProfileViewService struct{}

// NewProfileViewService creates a new profile view service
func NewProfileViewService() *ProfileViewService {
	return &ProfileViewService{}
}

// TrackProfileView records a profile view between two users
func (s *ProfileViewService) TrackProfileView(viewerID, viewedID uint) (bool, error) {
	// Users cannot track viewing their own profile
	if viewerID == viewedID {
		return false, utils.NewAppError("cannot track viewing your own profile", 400)
	}

	// Check if viewed user exists
	var viewedUser models.User
	if err := conf.DB.First(&viewedUser, viewedID).Error; err != nil {
		return false, utils.NewAppError("user not found", 404)
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
			ViewedID: viewedID,
		}

		if err := conf.DB.Create(&profileView).Error; err != nil {
			return false, utils.NewAppError("failed to track profile view", 500)
		}
		return true, nil // New record created
	}

	return false, nil // Recent view exists, not tracked
}

// GetProfileViewers returns users who viewed the specified user's profile
func (s *ProfileViewService) GetProfileViewers(userID uint, params utils.PaginationParams) ([]models.ProfileView, int64, error) {
	var profileViews []models.ProfileView
	if err := conf.DB.Preload("Viewer").
		Where("viewed_id = ?", userID).
		Order("created_at DESC").
		Limit(params.Limit).
		Offset(params.Offset).
		Find(&profileViews).Error; err != nil {
		return nil, 0, utils.NewAppError("failed to get profile viewers", 500)
	}

	// Get total count
	var total int64
	conf.DB.Model(&models.ProfileView{}).Where("viewed_id = ?", userID).Count(&total)

	return profileViews, total, nil
}

// GetViewedProfiles returns profiles that the specified user has viewed
func (s *ProfileViewService) GetViewedProfiles(userID uint, params utils.PaginationParams) ([]models.ProfileView, int64, error) {
	var profileViews []models.ProfileView
	if err := conf.DB.Preload("Viewed").
		Where("viewer_id = ?", userID).
		Order("created_at DESC").
		Limit(params.Limit).
		Offset(params.Offset).
		Find(&profileViews).Error; err != nil {
		return nil, 0, utils.NewAppError("failed to get viewed profiles", 500)
	}

	// Get total count
	var total int64
	conf.DB.Model(&models.ProfileView{}).Where("viewer_id = ?", userID).Count(&total)

	return profileViews, total, nil
}

// ProfileViewStats represents profile view statistics
type ProfileViewStats struct {
	TotalViews    int64      `json:"total_views"`
	UniqueViewers int64      `json:"unique_viewers"`
	WeeklyViews   int64      `json:"weekly_views"`
	DailyViews    int64      `json:"daily_views"`
	LastViewedAt  *time.Time `json:"last_viewed_at"`
}

// GetProfileViewStats returns profile view statistics for the specified user
func (s *ProfileViewService) GetProfileViewStats(userID uint) (*ProfileViewStats, error) {
	stats := &ProfileViewStats{}

	// Get total views
	conf.DB.Model(&models.ProfileView{}).Where("viewed_id = ?", userID).Count(&stats.TotalViews)

	// Get unique viewers count
	conf.DB.Model(&models.ProfileView{}).
		Select("DISTINCT viewer_id").
		Where("viewed_id = ?", userID).
		Count(&stats.UniqueViewers)

	// Get views in the last 7 days
	weekAgo := time.Now().AddDate(0, 0, -7)
	conf.DB.Model(&models.ProfileView{}).
		Where("viewed_id = ? AND created_at > ?", userID, weekAgo).
		Count(&stats.WeeklyViews)

	// Get views in the last 24 hours
	dayAgo := time.Now().AddDate(0, 0, -1)
	conf.DB.Model(&models.ProfileView{}).
		Where("viewed_id = ? AND created_at > ?", userID, dayAgo).
		Count(&stats.DailyViews)

	// Get last view date
	var lastView models.ProfileView
	if conf.DB.Where("viewed_id = ?", userID).
		Order("created_at DESC").
		First(&lastView).Error == nil {
		stats.LastViewedAt = &lastView.CreatedAt
	}

	return stats, nil
}