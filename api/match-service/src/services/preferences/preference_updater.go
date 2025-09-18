package preferences

import (
	"match-service/src/utils"
	"match-service/src/services/users"
)

// PreferenceUpdater handles machine learning and preference vector adjustments
type PreferenceUpdater struct {
	learningRate float64
	repository   *PreferenceRepository
}

// NewPreferenceUpdater creates a new PreferenceUpdater instance
func NewPreferenceUpdater(learningRate float64) *PreferenceUpdater {
	return &PreferenceUpdater{
		learningRate: learningRate,
		repository:   NewPreferenceRepository(),
	}
}

// UpdateUserPreferences adjusts user preferences based on interactions
func (u *PreferenceUpdater) UpdateUserPreferences(userID, targetUserID int, action string) error {
	// Get target user vector
	userService := users.NewUserService()
	targetVector, err := userService.GetUserVector(targetUserID)
	if err != nil {
		return err
	}

	// Get current preference vector
	defaultVector, err := userService.GetUserVector(userID)
	if err != nil {
		return err
	}

	currentPreferenceVector, err := u.repository.GetUserPreferenceVector(uint(userID), defaultVector)
	if err != nil {
		return err
	}

	// Determine learning direction based on action
	learningMultiplier := u.getLearningMultiplier(action)
	if learningMultiplier == 0 {
		return nil // No learning for unknown actions
	}

	// Update preference vector toward/away from target vector
	updatedVector := u.adjustVector(currentPreferenceVector, targetVector, learningMultiplier)

	// Save updated preferences
	return u.repository.SaveUserPreference(uint(userID), updatedVector)
}

// getLearningMultiplier returns the learning direction based on action
func (u *PreferenceUpdater) getLearningMultiplier(action string) float64 {
	switch action {
	case "like", "match":
		return u.learningRate
	case "pass", "block":
		return -u.learningRate
	default:
		return 0 // No learning for unknown actions
	}
}

// adjustVector moves currentVector toward or away from targetVector
func (u *PreferenceUpdater) adjustVector(currentVector, targetVector utils.UserVector, learningRate float64) utils.UserVector {
	return utils.UserVector{
		UserID:              currentVector.UserID,
		Age:                 u.adjustValue(currentVector.Age, targetVector.Age, learningRate),
		Height:              u.adjustValue(currentVector.Height, targetVector.Height, learningRate),
		Fame:                u.adjustValue(currentVector.Fame, targetVector.Fame, learningRate),
		AlcoholConsumption:  u.adjustValue(currentVector.AlcoholConsumption, targetVector.AlcoholConsumption, learningRate),
		Smoking:             u.adjustValue(currentVector.Smoking, targetVector.Smoking, learningRate),
		Cannabis:            u.adjustValue(currentVector.Cannabis, targetVector.Cannabis, learningRate),
		Drugs:               u.adjustValue(currentVector.Drugs, targetVector.Drugs, learningRate),
		Pets:                u.adjustValue(currentVector.Pets, targetVector.Pets, learningRate),
		SocialActivityLevel: u.adjustValue(currentVector.SocialActivityLevel, targetVector.SocialActivityLevel, learningRate),
		SportActivity:       u.adjustValue(currentVector.SportActivity, targetVector.SportActivity, learningRate),
		EducationLevel:      u.adjustValue(currentVector.EducationLevel, targetVector.EducationLevel, learningRate),
		Religion:            u.adjustValue(currentVector.Religion, targetVector.Religion, learningRate),
		ChildrenStatus:      u.adjustValue(currentVector.ChildrenStatus, targetVector.ChildrenStatus, learningRate),
		PoliticalView:       u.adjustValue(currentVector.PoliticalView, targetVector.PoliticalView, learningRate),
		Latitude:            u.adjustValue(currentVector.Latitude, targetVector.Latitude, learningRate),
		Longitude:           u.adjustValue(currentVector.Longitude, targetVector.Longitude, learningRate),
	}
}

// adjustValue moves current value toward target value by learningRate
func (u *PreferenceUpdater) adjustValue(current, target, learningRate float64) float64 {
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

// SetLearningRate updates the learning rate for preference updates
func (u *PreferenceUpdater) SetLearningRate(rate float64) {
	if rate >= 0 && rate <= 1 {
		u.learningRate = rate
	}
}

// GetLearningRate returns the current learning rate
func (u *PreferenceUpdater) GetLearningRate() float64 {
	return u.learningRate
}