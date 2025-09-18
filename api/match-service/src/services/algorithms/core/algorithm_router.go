package core

import (
	"errors"
	"fmt"
	"log"

	"match-service/src/services/types"
	"match-service/src/services/algorithms/vector"
	"match-service/src/services/algorithms/basic"
)

// AlgorithmRouter handles routing requests to appropriate matching algorithms
type AlgorithmRouter struct {
	vectorMatchingService *vector.VectorMatchingService
	basicMatchingService  *basic.BasicMatchingService
}

// NewAlgorithmRouter creates a new AlgorithmRouter instance
func NewAlgorithmRouter() *AlgorithmRouter {
	return &AlgorithmRouter{
		vectorMatchingService: vector.NewVectorMatchingService(),
		basicMatchingService:  basic.NewBasicMatchingService(),
	}
}

// ExecuteAlgorithm routes to the appropriate matching algorithm
func (r *AlgorithmRouter) ExecuteAlgorithm(request *types.MatchingRequest) ([]types.MatchResult, error) {
	switch request.Algorithm {
	case types.AlgorithmVectorBased, types.AlgorithmEnhancedVector:
		return r.executeVectorAlgorithm(request)

	case types.AlgorithmBasicCompatibility:
		return r.executeBasicCompatibility(request)

	case types.AlgorithmProximity:
		return r.executeProximityAlgorithm(request)

	case types.AlgorithmRandom:
		return r.executeRandomAlgorithm(request)

	case types.AlgorithmNewUsers:
		return r.executeNewUsersAlgorithm(request)

	case types.AlgorithmPopular:
		return r.executePopularAlgorithm(request)

	default:
		return nil, fmt.Errorf("unknown algorithm type: %s", request.Algorithm)
	}
}

// ExecuteCandidateAlgorithm routes to the appropriate algorithm and returns only candidates
func (r *AlgorithmRouter) ExecuteCandidateAlgorithm(request *types.MatchingRequest) ([]types.MatchCandidate, error) {
	log.Printf("🔍 [DEBUG Router] ExecuteCandidateAlgorithm - Algorithm: %s, UserID: %d", request.Algorithm, request.UserID)

	// For now, we'll convert full results to candidates
	// This is a temporary solution until we implement dedicated candidate methods in each service
	results, err := r.ExecuteAlgorithm(request)
	if err != nil {
		log.Printf("❌ [ERROR Router] ExecuteAlgorithm failed: %v", err)
		return nil, err
	}

	log.Printf("✅ [DEBUG Router] ExecuteAlgorithm returned %d results", len(results))
	candidates := r.convertResultsToCandidates(results)
	log.Printf("✅ [DEBUG Router] Converted to %d candidates", len(candidates))

	return candidates, nil
}

// executeVectorAlgorithm executes vector-based matching algorithms
func (r *AlgorithmRouter) executeVectorAlgorithm(request *types.MatchingRequest) ([]types.MatchResult, error) {
	log.Printf("🔍 [DEBUG Router] Executing vector algorithm for user %d", request.UserID)
	results, err := r.vectorMatchingService.GetPotentialMatches(
		request.UserID, request.Limit, request.MaxDistance, request.AgeRange)
	if err != nil {
		log.Printf("❌ [ERROR Router] Vector algorithm failed: %v", err)
		return nil, err
	}
	log.Printf("✅ [DEBUG Router] Vector algorithm returned %d results", len(results))
	return results, nil
}

// executeBasicCompatibility executes basic compatibility algorithm
func (r *AlgorithmRouter) executeBasicCompatibility(request *types.MatchingRequest) ([]types.MatchResult, error) {
	return r.basicMatchingService.GetMatches(
		request.UserID, request.Limit, request.MaxDistance, request.AgeRange)
}

// executeProximityAlgorithm executes proximity-based algorithm
func (r *AlgorithmRouter) executeProximityAlgorithm(request *types.MatchingRequest) ([]types.MatchResult, error) {
	if request.MaxDistance == nil {
		return nil, errors.New("max_distance is required for proximity algorithm")
	}
	return r.basicMatchingService.GetNearbyUsers(
		request.UserID, *request.MaxDistance, request.Limit)
}

// executeRandomAlgorithm executes random matching algorithm
func (r *AlgorithmRouter) executeRandomAlgorithm(request *types.MatchingRequest) ([]types.MatchResult, error) {
	return r.basicMatchingService.GetRandomMatches(request.UserID, request.Limit)
}

// executeNewUsersAlgorithm executes new users algorithm
func (r *AlgorithmRouter) executeNewUsersAlgorithm(request *types.MatchingRequest) ([]types.MatchResult, error) {
	daysBack := r.getDefaultDaysBack(request.DaysBack)
	return r.basicMatchingService.GetNewUsers(request.UserID, request.Limit, daysBack)
}

// executePopularAlgorithm executes popular users algorithm
func (r *AlgorithmRouter) executePopularAlgorithm(request *types.MatchingRequest) ([]types.MatchResult, error) {
	minFame := r.getDefaultMinFame(request.MinFame)
	return r.basicMatchingService.GetPopularUsers(request.UserID, request.Limit, minFame)
}

// convertResultsToCandidates converts MatchResult to MatchCandidate
func (r *AlgorithmRouter) convertResultsToCandidates(results []types.MatchResult) []types.MatchCandidate {
	candidates := make([]types.MatchCandidate, len(results))
	for i, result := range results {
		candidates[i] = types.MatchCandidate{
			ID:                 result.ID,
			AlgorithmType:      result.AlgorithmType,
			CompatibilityScore: result.CompatibilityScore,
			Distance:           result.Distance,
		}
	}
	return candidates
}

// getDefaultDaysBack returns default days back value
func (r *AlgorithmRouter) getDefaultDaysBack(daysBack *int) int {
	if daysBack != nil {
		return *daysBack
	}
	return 7 // Default to 7 days
}

// getDefaultMinFame returns default minimum fame value
func (r *AlgorithmRouter) getDefaultMinFame(minFame *int) int {
	if minFame != nil {
		return *minFame
	}
	return 0 // Default minimum fame
}