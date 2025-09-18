package services

import (
	"log"
	"time"

	"match-service/src/conf"
	"match-service/src/models"
	"match-service/src/utils"
)

// PreferenceRepository handles persistence and caching of user preferences
type PreferenceRepository struct{}

// NewPreferenceRepository creates a new PreferenceRepository instance
func NewPreferenceRepository() *PreferenceRepository {
	return &PreferenceRepository{}
}

// GetUserPreferenceVector retrieves or creates a preference vector for a user
func (r *PreferenceRepository) GetUserPreferenceVector(userID uint, defaultVector utils.UserVector) (utils.UserVector, error) {
	// Check cache first
	cacheKey := utils.PreferenceCacheKey(int(userID))
	if cached, exists := utils.PreferenceCache.Get(cacheKey); exists {
		if preferenceVector, ok := cached.(utils.PreferenceVector); ok {
			log.Printf("Cache hit for user %d preferences", userID)
			return preferenceVector.Vector, nil
		}
	}

	// Try to get from database
	var preferenceVector models.UserPreference
	err := conf.DB.Where("user_id = ?", userID).First(&preferenceVector).Error
	if err != nil {
		// No preference vector found, use default
		log.Printf("No preference vector found for user %d, using default", userID)
		return defaultVector, nil
	}

	// Convert database model to utils model
	vector := r.convertToUserVector(preferenceVector)

	// Cache the result
	prefVector := utils.PreferenceVector{
		UserID:      userID,
		Vector:      vector,
		UpdateCount: preferenceVector.UpdateCount,
	}
	utils.PreferenceCache.Set(cacheKey, prefVector, 10*time.Minute)

	return vector, nil
}

// SaveUserPreference creates or updates a user preference in database
func (r *PreferenceRepository) SaveUserPreference(userID uint, vector utils.UserVector) error {
	var preference models.UserPreference
	err := conf.DB.Where("user_id = ?", userID).First(&preference).Error

	if err != nil {
		// Create new preference record
		preference = r.convertToUserPreference(userID, vector)
		preference.UpdateCount = 1
		return conf.DB.Create(&preference).Error
	} else {
		// Update existing preference record
		r.updateUserPreference(&preference, vector)
		preference.UpdateCount++
		return conf.DB.Save(&preference).Error
	}
}

// GetUserPreferenceStats returns preference statistics for a user
func (r *PreferenceRepository) GetUserPreferenceStats(userID uint) (int, error) {
	var preference models.UserPreference
	err := conf.DB.Where("user_id = ?", userID).First(&preference).Error
	if err != nil {
		return 0, nil // No preferences found
	}
	return preference.UpdateCount, nil
}

// convertToUserVector converts database model to utils model
func (r *PreferenceRepository) convertToUserVector(pref models.UserPreference) utils.UserVector {
	return utils.UserVector{
		UserID:              pref.UserID,
		Age:                 pref.Age,
		Height:              pref.Height,
		Fame:                pref.Fame,
		AlcoholConsumption:  pref.AlcoholConsumption,
		Smoking:             pref.Smoking,
		Cannabis:            pref.Cannabis,
		Drugs:               pref.Drugs,
		Pets:                pref.Pets,
		SocialActivityLevel: pref.SocialActivityLevel,
		SportActivity:       pref.SportActivity,
		EducationLevel:      pref.EducationLevel,
		Religion:            pref.Religion,
		ChildrenStatus:      pref.ChildrenStatus,
		PoliticalView:       pref.PoliticalView,
		Latitude:            pref.Latitude,
		Longitude:           pref.Longitude,
	}
}

// convertToUserPreference converts utils model to database model
func (r *PreferenceRepository) convertToUserPreference(userID uint, vector utils.UserVector) models.UserPreference {
	return models.UserPreference{
		UserID:              userID,
		Age:                 vector.Age,
		Height:              vector.Height,
		Fame:                vector.Fame,
		AlcoholConsumption:  vector.AlcoholConsumption,
		Smoking:             vector.Smoking,
		Cannabis:            vector.Cannabis,
		Drugs:               vector.Drugs,
		Pets:                vector.Pets,
		SocialActivityLevel: vector.SocialActivityLevel,
		SportActivity:       vector.SportActivity,
		EducationLevel:      vector.EducationLevel,
		Religion:            vector.Religion,
		ChildrenStatus:      vector.ChildrenStatus,
		PoliticalView:       vector.PoliticalView,
		Latitude:            vector.Latitude,
		Longitude:           vector.Longitude,
	}
}

// updateUserPreference updates an existing preference with new vector values
func (r *PreferenceRepository) updateUserPreference(pref *models.UserPreference, vector utils.UserVector) {
	pref.Age = vector.Age
	pref.Height = vector.Height
	pref.Fame = vector.Fame
	pref.AlcoholConsumption = vector.AlcoholConsumption
	pref.Smoking = vector.Smoking
	pref.Cannabis = vector.Cannabis
	pref.Drugs = vector.Drugs
	pref.Pets = vector.Pets
	pref.SocialActivityLevel = vector.SocialActivityLevel
	pref.SportActivity = vector.SportActivity
	pref.EducationLevel = vector.EducationLevel
	pref.Religion = vector.Religion
	pref.ChildrenStatus = vector.ChildrenStatus
	pref.PoliticalView = vector.PoliticalView
	pref.Latitude = vector.Latitude
	pref.Longitude = vector.Longitude
}