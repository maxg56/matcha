package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"user-service/src/conf"
	"user-service/src/models"
	"user-service/src/utils"
)

// PreferenceRequest represents matching preference payload
type PreferenceRequest struct {
	AgeMin           int      `json:"age_min" binding:"min=18,max=99"`
	AgeMax           int      `json:"age_max" binding:"min=18,max=99"`
	MaxDistance      float64  `json:"max_distance" binding:"min=1,max=10000"`
	MinFame          int      `json:"min_fame" binding:"min=0"`
	PreferredGenders []string `json:"preferred_genders" binding:"required"`
	RequiredTags     []string `json:"required_tags"`
	BlockedTags      []string `json:"blocked_tags"`
}

// GetPreferencesHandler gets user's matching preferences
func GetPreferencesHandler(c *gin.Context) {
	userIDParam := c.Param("id")

	id, err := strconv.ParseUint(userIDParam, 10, 32)
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

	// Users can only view their own preferences
	if uint(id) != authenticatedUserID.(uint) {
		utils.RespondError(c, http.StatusForbidden, "cannot view another user's preferences")
		return
	}

	var preference models.UserPreference
	if err := conf.DB.Where("user_id = ?", id).First(&preference).Error; err != nil {
		// Create default preferences if none exist
		preference = models.UserPreference{
			UserID:           uint(id),
			AgeMin:           18,
			AgeMax:           99,
			MaxDistance:      50,
			MinFame:          0,
			PreferredGenders: `["male","female","other"]`,
			RequiredTags:     `[]`,
			BlockedTags:      `[]`,
		}
		if err := conf.DB.Create(&preference).Error; err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "failed to create default preferences")
			return
		}
	}

	// Parse JSON fields
	var preferredGenders, requiredTags, blockedTags []string
	json.Unmarshal([]byte(preference.PreferredGenders), &preferredGenders)
	json.Unmarshal([]byte(preference.RequiredTags), &requiredTags)
	json.Unmarshal([]byte(preference.BlockedTags), &blockedTags)

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"preferences": gin.H{
			"id":                preference.ID,
			"user_id":           preference.UserID,
			"age_min":           preference.AgeMin,
			"age_max":           preference.AgeMax,
			"max_distance":      preference.MaxDistance,
			"min_fame":          preference.MinFame,
			"preferred_genders": preferredGenders,
			"required_tags":     requiredTags,
			"blocked_tags":      blockedTags,
			"created_at":        preference.CreatedAt,
			"updated_at":        preference.UpdatedAt,
		},
	})
}

// UpdatePreferencesHandler updates user's matching preferences
func UpdatePreferencesHandler(c *gin.Context) {
	userIDParam := c.Param("id")

	id, err := strconv.ParseUint(userIDParam, 10, 32)
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

	// Users can only update their own preferences
	if uint(id) != authenticatedUserID.(uint) {
		utils.RespondError(c, http.StatusForbidden, "cannot update another user's preferences")
		return
	}

	var req PreferenceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid preferences data: "+err.Error())
		return
	}

	// Validate age range
	if req.AgeMin >= req.AgeMax {
		utils.RespondError(c, http.StatusBadRequest, "age_min must be less than age_max")
		return
	}

	// Convert arrays to JSON strings
	preferredGendersJSON, _ := json.Marshal(req.PreferredGenders)
	requiredTagsJSON, _ := json.Marshal(req.RequiredTags)
	blockedTagsJSON, _ := json.Marshal(req.BlockedTags)

	// Find or create preferences
	var preference models.UserPreference
	result := conf.DB.Where("user_id = ?", id).First(&preference)
	if result.Error != nil {
		// Create new preferences
		preference = models.UserPreference{
			UserID:           uint(id),
			AgeMin:           req.AgeMin,
			AgeMax:           req.AgeMax,
			MaxDistance:      req.MaxDistance,
			MinFame:          req.MinFame,
			PreferredGenders: string(preferredGendersJSON),
			RequiredTags:     string(requiredTagsJSON),
			BlockedTags:      string(blockedTagsJSON),
		}
		if err := conf.DB.Create(&preference).Error; err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "failed to create preferences")
			return
		}
	} else {
		// Update existing preferences
		preference.AgeMin = req.AgeMin
		preference.AgeMax = req.AgeMax
		preference.MaxDistance = req.MaxDistance
		preference.MinFame = req.MinFame
		preference.PreferredGenders = string(preferredGendersJSON)
		preference.RequiredTags = string(requiredTagsJSON)
		preference.BlockedTags = string(blockedTagsJSON)

		if err := conf.DB.Save(&preference).Error; err != nil {
			utils.RespondError(c, http.StatusInternalServerError, "failed to update preferences")
			return
		}
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "Preferences updated successfully",
		"preferences": gin.H{
			"id":                preference.ID,
			"user_id":           preference.UserID,
			"age_min":           preference.AgeMin,
			"age_max":           preference.AgeMax,
			"max_distance":      preference.MaxDistance,
			"min_fame":          preference.MinFame,
			"preferred_genders": req.PreferredGenders,
			"required_tags":     req.RequiredTags,
			"blocked_tags":      req.BlockedTags,
			"updated_at":        preference.UpdatedAt,
		},
	})
}