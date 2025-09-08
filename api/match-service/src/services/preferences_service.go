package services

import (
	"errors"
	"log"
	"time"

	"match-service/src/conf"
	"match-service/src/models"
	"match-service/src/utils"
)

// PreferencesService handles user preference learning and management
type PreferencesService struct {
	learningRate     float64
	randomnessFactor float64
}

// NewPreferencesService creates a new PreferencesService instance
func NewPreferencesService() *PreferencesService {
	return &PreferencesService{
		learningRate:     0.1,
		randomnessFactor: 0.15,
	}
}

// GetUserPreferenceVector retrieves or creates a preference vector for a user
func (p *PreferencesService) GetUserPreferenceVector(userID uint, defaultVector utils.UserVector) (utils.UserVector, error) {
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
		// No preference vector found, create default
		log.Printf("No preference vector found for user %d, using default", userID)
		return defaultVector, nil
	}

	// Convert database model to utils model
	vector := utils.UserVector{
		UserID:              userID,
		Age:                 preferenceVector.Age,
		Height:              preferenceVector.Height,
		Fame:                preferenceVector.Fame,
		AlcoholConsumption:  preferenceVector.AlcoholConsumption,
		Smoking:             preferenceVector.Smoking,
		Cannabis:            preferenceVector.Cannabis,
		Drugs:               preferenceVector.Drugs,
		Pets:                preferenceVector.Pets,
		SocialActivityLevel: preferenceVector.SocialActivityLevel,
		SportActivity:       preferenceVector.SportActivity,
		EducationLevel:      preferenceVector.EducationLevel,
		Religion:            preferenceVector.Religion,
		ChildrenStatus:      preferenceVector.ChildrenStatus,
		PoliticalView:       preferenceVector.PoliticalView,
		Latitude:            preferenceVector.Latitude,
		Longitude:           preferenceVector.Longitude,
	}

	// Cache the result
	prefVector := utils.PreferenceVector{
		UserID:      userID,
		Vector:      vector,
		UpdateCount: preferenceVector.UpdateCount,
	}
	utils.PreferenceCache.Set(cacheKey, prefVector, 10*time.Minute)

	return vector, nil
}

// RecordInteraction records a user interaction and updates preferences
func (p *PreferencesService) RecordInteraction(userID, targetUserID int, action string) (map[string]interface{}, error) {
	// Validate users exist
	userService := NewUserService()
	if err := userService.ValidateUserExists(userID); err != nil {
		return nil, err
	}
	if err := userService.ValidateUserExists(targetUserID); err != nil {
		return nil, err
	}

	// Create interaction record
	interaction := models.UserInteraction{
		UserID:          uint(userID),
		TargetUserID:    uint(targetUserID),
		InteractionType: action,
	}

	if err := conf.DB.Create(&interaction).Error; err != nil {
		return nil, errors.New("failed to record interaction")
	}

	// Update user preferences based on the interaction
	if err := p.updateUserPreferences(userID, targetUserID, action); err != nil {
		log.Printf("Warning: Failed to update user preferences: %v", err)
	}

	// Invalidate cache for this user
	utils.InvalidateUserCache(userID)

	result := map[string]interface{}{
		"interaction_id": interaction.ID,
		"user_id":        userID,
		"target_user_id": targetUserID,
		"action":         action,
		"timestamp":      interaction.CreatedAt,
		"message":        "Interaction recorded successfully",
	}

	return result, nil
}

// updateUserPreferences adjusts user preferences based on interactions
func (p *PreferencesService) updateUserPreferences(userID, targetUserID int, action string) error {
	// Get target user vector
	userService := NewUserService()
	targetVector, err := userService.GetUserVector(targetUserID)
	if err != nil {
		return err
	}

	// Get current preference vector
	defaultVector, err := userService.GetUserVector(userID)
	if err != nil {
		return err
	}

	currentPreferenceVector, err := p.GetUserPreferenceVector(uint(userID), defaultVector)
	if err != nil {
		return err
	}

	// Determine learning direction based on action
	var learningMultiplier float64
	switch action {
	case "like", "match":
		learningMultiplier = p.learningRate
	case "pass", "block":
		learningMultiplier = -p.learningRate
	default:
		return nil // No learning for unknown actions
	}

	// Update preference vector toward/away from target vector
	updatedVector := p.adjustVector(currentPreferenceVector, targetVector, learningMultiplier)

	// Save or update in database
	var preference models.UserPreference
	err = conf.DB.Where("user_id = ?", userID).First(&preference).Error
	
	if err != nil {
		// Create new preference record
		preference = models.UserPreference{
			UserID:              uint(userID),
			Age:                 updatedVector.Age,
			Height:              updatedVector.Height,
			Fame:                updatedVector.Fame,
			AlcoholConsumption:  updatedVector.AlcoholConsumption,
			Smoking:             updatedVector.Smoking,
			Cannabis:            updatedVector.Cannabis,
			Drugs:               updatedVector.Drugs,
			Pets:                updatedVector.Pets,
			SocialActivityLevel: updatedVector.SocialActivityLevel,
			SportActivity:       updatedVector.SportActivity,
			EducationLevel:      updatedVector.EducationLevel,
			Religion:            updatedVector.Religion,
			ChildrenStatus:      updatedVector.ChildrenStatus,
			PoliticalView:       updatedVector.PoliticalView,
			Latitude:            updatedVector.Latitude,
			Longitude:           updatedVector.Longitude,
			UpdateCount:         1,
		}
		return conf.DB.Create(&preference).Error
	} else {
		// Update existing preference record
		preference.Age = updatedVector.Age
		preference.Height = updatedVector.Height
		preference.Fame = updatedVector.Fame
		preference.AlcoholConsumption = updatedVector.AlcoholConsumption
		preference.Smoking = updatedVector.Smoking
		preference.Cannabis = updatedVector.Cannabis
		preference.Drugs = updatedVector.Drugs
		preference.Pets = updatedVector.Pets
		preference.SocialActivityLevel = updatedVector.SocialActivityLevel
		preference.SportActivity = updatedVector.SportActivity
		preference.EducationLevel = updatedVector.EducationLevel
		preference.Religion = updatedVector.Religion
		preference.ChildrenStatus = updatedVector.ChildrenStatus
		preference.PoliticalView = updatedVector.PoliticalView
		preference.Latitude = updatedVector.Latitude
		preference.Longitude = updatedVector.Longitude
		preference.UpdateCount++
		
		return conf.DB.Save(&preference).Error
	}
}

// adjustVector moves currentVector toward or away from targetVector
func (p *PreferencesService) adjustVector(currentVector, targetVector utils.UserVector, learningRate float64) utils.UserVector {
	return utils.UserVector{
		UserID:              currentVector.UserID,
		Age:                 p.adjustValue(currentVector.Age, targetVector.Age, learningRate),
		Height:              p.adjustValue(currentVector.Height, targetVector.Height, learningRate),
		Fame:                p.adjustValue(currentVector.Fame, targetVector.Fame, learningRate),
		AlcoholConsumption:  p.adjustValue(currentVector.AlcoholConsumption, targetVector.AlcoholConsumption, learningRate),
		Smoking:             p.adjustValue(currentVector.Smoking, targetVector.Smoking, learningRate),
		Cannabis:            p.adjustValue(currentVector.Cannabis, targetVector.Cannabis, learningRate),
		Drugs:               p.adjustValue(currentVector.Drugs, targetVector.Drugs, learningRate),
		Pets:                p.adjustValue(currentVector.Pets, targetVector.Pets, learningRate),
		SocialActivityLevel: p.adjustValue(currentVector.SocialActivityLevel, targetVector.SocialActivityLevel, learningRate),
		SportActivity:       p.adjustValue(currentVector.SportActivity, targetVector.SportActivity, learningRate),
		EducationLevel:      p.adjustValue(currentVector.EducationLevel, targetVector.EducationLevel, learningRate),
		Religion:            p.adjustValue(currentVector.Religion, targetVector.Religion, learningRate),
		ChildrenStatus:      p.adjustValue(currentVector.ChildrenStatus, targetVector.ChildrenStatus, learningRate),
		PoliticalView:       p.adjustValue(currentVector.PoliticalView, targetVector.PoliticalView, learningRate),
		Latitude:            p.adjustValue(currentVector.Latitude, targetVector.Latitude, learningRate),
		Longitude:           p.adjustValue(currentVector.Longitude, targetVector.Longitude, learningRate),
	}
}

// adjustValue moves current value toward target value by learningRate
func (p *PreferencesService) adjustValue(current, target, learningRate float64) float64 {
	adjustment := (target - current) * learningRate
	newValue := current + adjustment
	
	// Ensure value stays within [0, 1] bounds
	if newValue < 0 {
		return 0
	}
	if newValue > 1 {
		return 1
	}
	
	return newValue
}

// GetUserPreferences returns user preference information
func (p *PreferencesService) GetUserPreferences(userID int) (map[string]interface{}, error) {
	userService := NewUserService()
	if err := userService.ValidateUserExists(userID); err != nil {
		return nil, err
	}

	// Get default vector for comparison
	defaultVector, err := userService.GetUserVector(userID)
	if err != nil {
		return nil, err
	}

	// Get learned preferences
	preferenceVector, err := p.GetUserPreferenceVector(uint(userID), defaultVector)
	if err != nil {
		return nil, err
	}

	// Get preference statistics
	var preference models.UserPreference
	updateCount := 0
	err = conf.DB.Where("user_id = ?", userID).First(&preference).Error
	if err == nil {
		updateCount = preference.UpdateCount
	}

	// Get interaction history
	var interactionCount int64
	conf.DB.Model(&models.UserInteraction{}).Where("user_id = ?", userID).Count(&interactionCount)

	result := map[string]interface{}{
		"user_id":          userID,
		"preference_vector": preferenceVector,
		"default_vector":   defaultVector,
		"update_count":     updateCount,
		"interaction_count": interactionCount,
		"learning_rate":    p.learningRate,
		"randomness_factor": p.randomnessFactor,
	}

	return result, nil
}

// SetLearningRate updates the learning rate for preference updates
func (p *PreferencesService) SetLearningRate(rate float64) {
	if rate >= 0 && rate <= 1 {
		p.learningRate = rate
	}
}

// SetRandomnessFactor updates the randomness factor for match diversity
func (p *PreferencesService) SetRandomnessFactor(factor float64) {
	if factor >= 0 && factor <= 1 {
		p.randomnessFactor = factor
	}
}