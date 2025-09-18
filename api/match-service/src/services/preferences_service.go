package services

import (
	"match-service/src/utils"
)

// PreferencesService handles user preference learning and management
type PreferencesService struct {
	learningRate       float64
	randomnessFactor   float64
	repository         *PreferenceRepository
	interactionManager *InteractionManager
}

// NewPreferencesService creates a new PreferencesService instance
func NewPreferencesService() *PreferencesService {
	learningRate := 0.1
	return &PreferencesService{
		learningRate:       learningRate,
		randomnessFactor:   0.15,
		repository:         NewPreferenceRepository(),
		interactionManager: NewInteractionManager(learningRate),
	}
}

// GetUserPreferenceVector retrieves or creates a preference vector for a user
func (p *PreferencesService) GetUserPreferenceVector(userID uint, defaultVector utils.UserVector) (utils.UserVector, error) {
	return p.repository.GetUserPreferenceVector(userID, defaultVector)
}

// RecordInteraction records a user interaction and updates preferences
func (p *PreferencesService) RecordInteraction(userID, targetUserID int, action string) (map[string]interface{}, error) {
	return p.interactionManager.RecordInteraction(userID, targetUserID, action)
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
	updateCount, err := p.repository.GetUserPreferenceStats(uint(userID))
	if err != nil {
		updateCount = 0
	}

	// Get interaction history
	interactionCount, err := p.interactionManager.GetInteractionCount(userID)
	if err != nil {
		interactionCount = 0
	}

	result := map[string]interface{}{
		"user_id":           userID,
		"preference_vector": preferenceVector,
		"default_vector":    defaultVector,
		"update_count":      updateCount,
		"interaction_count": interactionCount,
		"learning_rate":     p.learningRate,
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