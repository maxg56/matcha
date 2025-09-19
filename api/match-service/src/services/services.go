package services

import (
	"match-service/src/services/algorithms"
	"match-service/src/services/cache"
	"match-service/src/services/interactions"
	"match-service/src/services/matching"
	"match-service/src/services/preferences"
	"match-service/src/services/types"
	"match-service/src/services/users"
	"match-service/src/services/validation"
)

// Re-export types from types package
type (
	MatchResult      = types.MatchResult
	MatchCandidate   = types.MatchCandidate
	AgeRange         = types.AgeRange
	AlgorithmType    = types.AlgorithmType
	MatchingRequest  = types.MatchingRequest
	AlgorithmInfo    = types.AlgorithmInfo
)

// Re-export constants from types package
const (
	AlgorithmVectorBased        = types.AlgorithmVectorBased
	AlgorithmEnhancedVector     = types.AlgorithmEnhancedVector
	AlgorithmBasicCompatibility = types.AlgorithmBasicCompatibility
	AlgorithmProximity          = types.AlgorithmProximity
	AlgorithmRandom             = types.AlgorithmRandom
	AlgorithmNewUsers           = types.AlgorithmNewUsers
	AlgorithmPopular            = types.AlgorithmPopular
)

// Re-export service constructors from algorithms package
var (
	NewAlgorithmService      = algorithms.NewAlgorithmService
	NewVectorMatchingService = algorithms.NewVectorMatchingService
	NewBasicMatchingService  = algorithms.NewBasicMatchingService
	NewCompatibilityService  = algorithms.NewCompatibilityService
	NewMatrixService         = algorithms.NewMatrixService
	NewAlgorithmRouter       = algorithms.NewAlgorithmRouter
)

// Re-export service constructors from cache package
var (
	NewCacheService = cache.NewCacheService
	NewCacheManager = cache.NewCacheManager
)

// Re-export service constructors from interactions package
var (
	NewInteractionService = interactions.NewInteractionService
	NewInteractionManager = interactions.NewInteractionManager
)

// Re-export service constructors from matching package
var (
	NewMatchService        = matching.NewMatchService
	NewUserMatchingService = matching.NewUserMatchingService
	NewMatchingRequestBuilder = matching.NewMatchingRequestBuilder
)

// Re-export service constructors from preferences package
var (
	NewUserPreferencesManager = preferences.NewUserPreferencesManager
)

// Re-export service constructors from users package
var (
	NewUserService            = users.NewUserService
	NewUserRepository         = users.NewUserRepository
	NewProfileTrackingService = users.NewProfileTrackingService
)

// Re-export service constructors from validation package
var (
	NewRequestValidator = validation.NewRequestValidator
)