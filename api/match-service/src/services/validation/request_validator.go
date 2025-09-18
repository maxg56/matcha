package validation

import (
	"errors"
	"match-service/src/services/types"
)

// RequestValidator handles validation of matching requests
type RequestValidator struct{}

// NewRequestValidator creates a new RequestValidator instance
func NewRequestValidator() *RequestValidator {
	return &RequestValidator{}
}

// ValidateMatchingRequest validates the matching request parameters
func (v *RequestValidator) ValidateMatchingRequest(request *types.MatchingRequest) error {
	if err := v.validateBasicRequest(request); err != nil {
		return err
	}

	if err := v.validateUserID(request.UserID); err != nil {
		return err
	}

	if err := v.validateLimit(request.Limit); err != nil {
		return err
	}

	if err := v.validateMaxDistance(request.MaxDistance); err != nil {
		return err
	}

	if err := v.validateAgeRange(request.AgeRange); err != nil {
		return err
	}

	if err := v.validateOptionalParams(request); err != nil {
		return err
	}

	return nil
}

// validateBasicRequest validates basic request structure
func (v *RequestValidator) validateBasicRequest(request *types.MatchingRequest) error {
	if request == nil {
		return errors.New("matching request cannot be nil")
	}
	return nil
}

// validateUserID validates the user ID parameter
func (v *RequestValidator) validateUserID(userID int) error {
	if userID <= 0 {
		return errors.New("user_id must be positive")
	}
	return nil
}

// validateLimit validates the limit parameter
func (v *RequestValidator) validateLimit(limit int) error {
	if limit <= 0 {
		return errors.New("limit must be positive")
	}

	if limit > 100 {
		return errors.New("limit cannot exceed 100")
	}

	return nil
}

// validateMaxDistance validates the max distance parameter
func (v *RequestValidator) validateMaxDistance(maxDistance *int) error {
	if maxDistance != nil && *maxDistance <= 0 {
		return errors.New("max_distance must be positive")
	}
	return nil
}

// validateAgeRange validates the age range parameter
func (v *RequestValidator) validateAgeRange(ageRange *types.AgeRange) error {
	if ageRange == nil {
		return nil
	}

	if ageRange.Min < 18 || ageRange.Min > 100 {
		return errors.New("age range minimum must be between 18 and 100")
	}

	if ageRange.Max < 18 || ageRange.Max > 100 {
		return errors.New("age range maximum must be between 18 and 100")
	}

	if ageRange.Min > ageRange.Max {
		return errors.New("age range minimum cannot be greater than maximum")
	}

	return nil
}

// validateOptionalParams validates optional parameters
func (v *RequestValidator) validateOptionalParams(request *types.MatchingRequest) error {
	if request.MinFame != nil && *request.MinFame < 0 {
		return errors.New("min_fame cannot be negative")
	}

	if request.DaysBack != nil && *request.DaysBack <= 0 {
		return errors.New("days_back must be positive")
	}

	return nil
}

// ValidateAlgorithmRequirements validates algorithm-specific requirements
func (v *RequestValidator) ValidateAlgorithmRequirements(request *types.MatchingRequest) error {
	switch request.Algorithm {
	case types.AlgorithmProximity:
		if request.MaxDistance == nil {
			return errors.New("max_distance is required for proximity algorithm")
		}
	case types.AlgorithmNewUsers:
		// DaysBack is optional, will use default if not provided
	case types.AlgorithmPopular:
		// MinFame is optional, will use default if not provided
	}
	return nil
}