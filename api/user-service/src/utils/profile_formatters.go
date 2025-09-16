package utils

import (
	"time"

	"github.com/gin-gonic/gin"

	"user-service/src/models"
)

// ProfileViewerResponse represents a profile viewer in API response
type ProfileViewerResponse struct {
	Viewer   UserProfileSummary `json:"viewer"`
	ViewedAt time.Time          `json:"viewed_at"`
}

// ViewedProfileResponse represents a viewed profile in API response
type ViewedProfileResponse struct {
	Profile  UserProfileSummary `json:"profile"`
	ViewedAt time.Time          `json:"viewed_at"`
}

// UserProfileSummary represents a summarized user profile
type UserProfileSummary struct {
	ID        uint   `json:"id"`
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	Age       int    `json:"age"`
	Fame      int    `json:"fame"`
}

// FormatProfileViewers formats profile view data for API response
func FormatProfileViewers(profileViews []models.ProfileView) []ProfileViewerResponse {
	var viewers []ProfileViewerResponse
	for _, view := range profileViews {
		viewers = append(viewers, ProfileViewerResponse{
			Viewer: UserProfileSummary{
				ID:        view.Viewer.ID,
				Username:  view.Viewer.Username,
				FirstName: view.Viewer.FirstName,
				Age:       view.Viewer.Age,
				Fame:      view.Viewer.Fame,
			},
			ViewedAt: view.CreatedAt,
		})
	}
	return viewers
}

// FormatViewedProfiles formats viewed profile data for API response
func FormatViewedProfiles(profileViews []models.ProfileView) []ViewedProfileResponse {
	var viewedProfiles []ViewedProfileResponse
	for _, view := range profileViews {
		viewedProfiles = append(viewedProfiles, ViewedProfileResponse{
			Profile: UserProfileSummary{
				ID:        view.Viewed.ID,
				Username:  view.Viewed.Username,
				FirstName: view.Viewed.FirstName,
				Age:       view.Viewed.Age,
				Fame:      view.Viewed.Fame,
			},
			ViewedAt: view.CreatedAt,
		})
	}
	return viewedProfiles
}

// FormatProfileViewersLegacy formats profile view data in legacy format (for backward compatibility)
func FormatProfileViewersLegacy(profileViews []models.ProfileView) []gin.H {
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
	return viewers
}

// FormatViewedProfilesLegacy formats viewed profile data in legacy format (for backward compatibility)
func FormatViewedProfilesLegacy(profileViews []models.ProfileView) []gin.H {
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
	return viewedProfiles
}