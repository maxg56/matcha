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

// contains checks if a slice contains a specific string
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// PreferenceRequest represents matching preference payload
type PreferenceRequest struct {
	AgeMin           int      `json:"age_min" binding:"min=18,max=99"`
	AgeMax           int      `json:"age_max" binding:"min=18,max=99"`
	MaxDistance      float64  `json:"max_distance" binding:"min=1,max=10000"`
	MinFame          int      `json:"min_fame" binding:"min=0"`
	PreferredGenders []string `json:"preferred_genders" binding:"required"`
	RequiredTags     []string `json:"required_tags"`
	BlockedTags      []string `json:"blocked_tags"`

	// Lifestyle preferences
	SmokingPreference  *string `json:"smoking_preference,omitempty"`   // "any", "smoker", "non_smoker"
	AlcoholPreference  *string `json:"alcohol_preference,omitempty"`   // "any", "drinker", "non_drinker"
	DrugsPreference    *string `json:"drugs_preference,omitempty"`     // "any", "user", "non_user"
	CannabisPreference *string `json:"cannabis_preference,omitempty"`  // "any", "user", "non_user"

	// Religious preferences
	ReligionPreference *string  `json:"religion_preference,omitempty"` // "any", "same", "different"
	BlockedReligions   []string `json:"blocked_religions,omitempty"`   // Array of blocked religions
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
	if int(id) != authenticatedUserID.(int) {
		utils.RespondError(c, http.StatusForbidden, "cannot view another user's preferences")
		return
	}

	var preference models.UserPreference
	if err := conf.DB.Where("user_id = ?", id).First(&preference).Error; err != nil {
		// Create default preferences if none exist
		preference = models.UserPreference{
			UserID:           int(id),
			AgeMin:           18,
			AgeMax:           99,
			MaxDistance:      500, // Increased to 500km to fix discovery issue
			MinFame:          0,
			PreferredGenders: `["man","woman","other"]`,
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

	// Parse blocked religions JSON
	var blockedReligions []string
	if preference.BlockedReligions != "" {
		json.Unmarshal([]byte(preference.BlockedReligions), &blockedReligions)
	}

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
			"smoking_preference": preference.SmokingPreference,
			"alcohol_preference": preference.AlcoholPreference,
			"drugs_preference":   preference.DrugsPreference,
			"cannabis_preference": preference.CannabisPreference,
			"religion_preference": preference.ReligionPreference,
			"blocked_religions":  blockedReligions,
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
	if int(id) != authenticatedUserID.(int) {
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

	// Validate lifestyle preferences
	if req.SmokingPreference != nil {
		validValues := []string{"any", "smoker", "non_smoker"}
		if !contains(validValues, *req.SmokingPreference) {
			utils.RespondError(c, http.StatusBadRequest, "invalid smoking_preference value")
			return
		}
	}
	if req.AlcoholPreference != nil {
		validValues := []string{"any", "drinker", "non_drinker"}
		if !contains(validValues, *req.AlcoholPreference) {
			utils.RespondError(c, http.StatusBadRequest, "invalid alcohol_preference value")
			return
		}
	}
	if req.DrugsPreference != nil {
		validValues := []string{"any", "user", "non_user"}
		if !contains(validValues, *req.DrugsPreference) {
			utils.RespondError(c, http.StatusBadRequest, "invalid drugs_preference value")
			return
		}
	}
	if req.CannabisPreference != nil {
		validValues := []string{"any", "user", "non_user"}
		if !contains(validValues, *req.CannabisPreference) {
			utils.RespondError(c, http.StatusBadRequest, "invalid cannabis_preference value")
			return
		}
	}
	if req.ReligionPreference != nil {
		validValues := []string{"any", "same", "different"}
		if !contains(validValues, *req.ReligionPreference) {
			utils.RespondError(c, http.StatusBadRequest, "invalid religion_preference value")
			return
		}
	}

	// Convert arrays to JSON strings
	preferredGendersJSON, _ := json.Marshal(req.PreferredGenders)
	requiredTagsJSON, _ := json.Marshal(req.RequiredTags)
	blockedTagsJSON, _ := json.Marshal(req.BlockedTags)
	blockedReligionsJSON, _ := json.Marshal(req.BlockedReligions)

	// Find or create preferences
	var preference models.UserPreference
	result := conf.DB.Where("user_id = ?", id).First(&preference)
	if result.Error != nil {
		// Create new preferences
		preference = models.UserPreference{
			UserID:           int(id),
			AgeMin:           req.AgeMin,
			AgeMax:           req.AgeMax,
			MaxDistance:      req.MaxDistance,
			MinFame:          req.MinFame,
			PreferredGenders: string(preferredGendersJSON),
			RequiredTags:     string(requiredTagsJSON),
			BlockedTags:      string(blockedTagsJSON),
			SmokingPreference:  req.SmokingPreference,
			AlcoholPreference:  req.AlcoholPreference,
			DrugsPreference:    req.DrugsPreference,
			CannabisPreference: req.CannabisPreference,
			ReligionPreference: req.ReligionPreference,
			BlockedReligions:   string(blockedReligionsJSON),
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
		preference.SmokingPreference = req.SmokingPreference
		preference.AlcoholPreference = req.AlcoholPreference
		preference.DrugsPreference = req.DrugsPreference
		preference.CannabisPreference = req.CannabisPreference
		preference.ReligionPreference = req.ReligionPreference
		preference.BlockedReligions = string(blockedReligionsJSON)

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
			"smoking_preference": req.SmokingPreference,
			"alcohol_preference": req.AlcoholPreference,
			"drugs_preference":   req.DrugsPreference,
			"cannabis_preference": req.CannabisPreference,
			"religion_preference": req.ReligionPreference,
			"blocked_religions":  req.BlockedReligions,
			"updated_at":        preference.UpdatedAt,
		},
	})
}