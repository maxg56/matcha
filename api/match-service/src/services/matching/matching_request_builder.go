package matching

import (
	"match-service/src/services/types"
	"match-service/src/services/validation"
)

// MatchingRequestBuilder helps build matching requests with validation
type MatchingRequestBuilder struct {
	request   *types.MatchingRequest
	validator *validation.RequestValidator
}

// NewMatchingRequestBuilder creates a new MatchingRequestBuilder instance
func NewMatchingRequestBuilder() *MatchingRequestBuilder {
	return &MatchingRequestBuilder{
		request:   &types.MatchingRequest{},
		validator: validation.NewRequestValidator(),
	}
}

// WithUserID sets the user ID for the request
func (b *MatchingRequestBuilder) WithUserID(userID int) *MatchingRequestBuilder {
	b.request.UserID = userID
	return b
}

// WithAlgorithm sets the algorithm type for the request
func (b *MatchingRequestBuilder) WithAlgorithm(algorithm types.AlgorithmType) *MatchingRequestBuilder {
	b.request.Algorithm = algorithm
	return b
}

// WithLimit sets the limit for the request
func (b *MatchingRequestBuilder) WithLimit(limit int) *MatchingRequestBuilder {
	b.request.Limit = limit
	return b
}

// WithMaxDistance sets the maximum distance for the request
func (b *MatchingRequestBuilder) WithMaxDistance(maxDistance int) *MatchingRequestBuilder {
	b.request.MaxDistance = &maxDistance
	return b
}

// WithAgeRange sets the age range for the request
func (b *MatchingRequestBuilder) WithAgeRange(min, max int) *MatchingRequestBuilder {
	b.request.AgeRange = &types.AgeRange{Min: min, Max: max}
	return b
}

// WithMinFame sets the minimum fame for the request
func (b *MatchingRequestBuilder) WithMinFame(minFame int) *MatchingRequestBuilder {
	b.request.MinFame = &minFame
	return b
}

// WithDaysBack sets the days back for the request
func (b *MatchingRequestBuilder) WithDaysBack(daysBack int) *MatchingRequestBuilder {
	b.request.DaysBack = &daysBack
	return b
}

// Build validates and returns the constructed request
func (b *MatchingRequestBuilder) Build() (*types.MatchingRequest, error) {
	if err := b.validator.ValidateMatchingRequest(b.request); err != nil {
		return nil, err
	}

	if err := b.validator.ValidateAlgorithmRequirements(b.request); err != nil {
		return nil, err
	}

	return b.request, nil
}

// BuildUnsafe returns the request without validation (use with caution)
func (b *MatchingRequestBuilder) BuildUnsafe() *types.MatchingRequest {
	return b.request
}

// Reset clears the builder to start a new request
func (b *MatchingRequestBuilder) Reset() *MatchingRequestBuilder {
	b.request = &types.MatchingRequest{}
	return b
}

// BuildMatchingRequest creates a MatchingRequest from individual parameters (legacy function)
func BuildMatchingRequest(userID int, algorithmType string, limit int, maxDistance *int, ageRange *types.AgeRange) *types.MatchingRequest {
	builder := NewMatchingRequestBuilder().
		WithUserID(userID).
		WithAlgorithm(types.AlgorithmType(algorithmType)).
		WithLimit(limit)

	if maxDistance != nil {
		builder = builder.WithMaxDistance(*maxDistance)
	}

	if ageRange != nil {
		builder = builder.WithAgeRange(ageRange.Min, ageRange.Max)
	}

	request, _ := builder.Build() // Legacy function doesn't handle errors
	return request
}