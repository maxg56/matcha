package matching

import (
	"log"

	"match-service/src/services/types"
	"match-service/src/services/users"
	"match-service/src/services/interactions"
	"match-service/src/services/algorithms"
)

// MatchService provides high-level matching operations using specialized services
type MatchService struct {
	userService        *users.UserService
	userMatchingService *UserMatchingService
	interactionService *interactions.InteractionService
	algorithmService   *algorithms.AlgorithmService
}

// NewMatchService creates a new MatchService with all dependencies
func NewMatchService() *MatchService {
	return &MatchService{
		userService:        users.NewUserService(),
		userMatchingService: NewUserMatchingService(),
		interactionService: interactions.NewInteractionService(),
		algorithmService:   algorithms.NewAlgorithmService(),
	}
}

// GetUserMatches retrieves active matches for a user
func (s *MatchService) GetUserMatches(userID int) ([]types.MatchResult, error) {
	return s.userMatchingService.GetUserMatches(userID)
}

// LikeUser records a like interaction and handles match creation
func (s *MatchService) LikeUser(userID, targetUserID int) (map[string]interface{}, error) {
	return s.interactionService.LikeUser(userID, targetUserID)
}

// UnlikeUser removes a like interaction and deactivates matches
func (s *MatchService) UnlikeUser(userID, targetUserID int) (map[string]interface{}, error) {
	return s.interactionService.UnlikeUser(userID, targetUserID)
}

// BlockUser blocks a user and removes any existing matches
func (s *MatchService) BlockUser(userID, targetUserID int) (map[string]interface{}, error) {
	return s.interactionService.BlockUser(userID, targetUserID)
}

// RunMatchingAlgorithm executes the specified matching algorithm and returns full profile data
func (s *MatchService) RunMatchingAlgorithm(userID int, algorithmType string, limit int, maxDistance *int, ageRange *types.AgeRange) ([]types.MatchResult, error) {
	request := BuildMatchingRequest(userID, algorithmType, limit, maxDistance, ageRange)
	return s.algorithmService.RunMatchingAlgorithm(request)
}

// GetMatchingCandidates executes the specified matching algorithm and returns only user IDs with scores
func (s *MatchService) GetMatchingCandidates(userID int, algorithmType string, limit int, maxDistance *int, ageRange *types.AgeRange) ([]types.MatchCandidate, error) {
	log.Printf("🔍 [DEBUG MatchService] GetMatchingCandidates called - UserID: %d, Algorithm: %s, Limit: %d", userID, algorithmType, limit)
	request := BuildMatchingRequest(userID, algorithmType, limit, maxDistance, ageRange)
	log.Printf("🔍 [DEBUG MatchService] Built request: %+v", request)

	candidates, err := s.algorithmService.GetMatchingCandidates(request)
	if err != nil {
		log.Printf("❌ [ERROR MatchService] Algorithm service returned error: %v", err)
		return nil, err
	}

	log.Printf("✅ [DEBUG MatchService] Algorithm service returned %d candidates", len(candidates))
	return candidates, nil
}

// GetUserInteractions retrieves all interactions for a user
func (s *MatchService) GetUserInteractions(userID int) ([]interface{}, error) {
	interactions, err := s.interactionService.GetUserInteractions(userID)
	if err != nil {
		return nil, err
	}
	
	// Convert to interface{} slice for JSON serialization compatibility
	result := make([]interface{}, len(interactions))
	for i, interaction := range interactions {
		result[i] = interaction
	}
	
	return result, nil
}

// GetInteractionBetweenUsers gets interaction between two specific users
func (s *MatchService) GetInteractionBetweenUsers(userID, targetUserID int) (map[string]interface{}, error) {
	interaction, err := s.interactionService.GetInteractionBetweenUsers(userID, targetUserID)
	if err != nil {
		return nil, err
	}
	
	return map[string]interface{}{
		"user_id":          interaction.UserID,
		"target_user_id":   interaction.TargetUserID,
		"interaction_type": interaction.InteractionType,
		"created_at":       interaction.CreatedAt,
	}, nil
}

// GetMutualLikes finds users who mutually liked each other
func (s *MatchService) GetMutualLikes(userID int) ([]int, error) {
	return s.interactionService.GetMutualInteractions(userID)
}

// IsUserBlocked checks if a user is blocked by another user
func (s *MatchService) IsUserBlocked(userID, targetUserID int) (bool, error) {
	return s.interactionService.IsUserBlocked(userID, targetUserID)
}

// GetAvailableAlgorithms returns all available matching algorithms
func (s *MatchService) GetAvailableAlgorithms() []types.AlgorithmInfo {
	return s.algorithmService.GetAvailableAlgorithms()
}

// GetAlgorithmPerformanceStats returns performance statistics for algorithms
func (s *MatchService) GetAlgorithmPerformanceStats() map[string]interface{} {
	return s.algorithmService.GetAlgorithmPerformanceStats()
}

// InvalidateUserCaches clears all cached data for a user
func (s *MatchService) InvalidateUserCaches(userID int) {
	s.algorithmService.InvalidateUserAlgorithmCaches(userID)
}

// GetNearbyUsers returns users within a specified distance
func (s *MatchService) GetNearbyUsers(userID int, maxDistanceKm int, limit int) ([]types.MatchResult, error) {
	request := &types.MatchingRequest{
		UserID:      userID,
		Algorithm:   types.AlgorithmProximity,
		Limit:       limit,
		MaxDistance: &maxDistanceKm,
	}
	return s.algorithmService.RunMatchingAlgorithm(request)
}

// GetRandomMatches returns random compatible users
func (s *MatchService) GetRandomMatches(userID int, limit int) ([]types.MatchResult, error) {
	request := &types.MatchingRequest{
		UserID:    userID,
		Algorithm: types.AlgorithmRandom,
		Limit:     limit,
	}
	return s.algorithmService.RunMatchingAlgorithm(request)
}

// GetNewUsers returns recently joined users
func (s *MatchService) GetNewUsers(userID int, limit int, daysBack int) ([]types.MatchResult, error) {
	request := &types.MatchingRequest{
		UserID:   userID,
		Algorithm: types.AlgorithmNewUsers,
		Limit:    limit,
		DaysBack: &daysBack,
	}
	return s.algorithmService.RunMatchingAlgorithm(request)
}

// GetPopularUsers returns users with high fame ratings
func (s *MatchService) GetPopularUsers(userID int, limit int, minFame int) ([]types.MatchResult, error) {
	request := &types.MatchingRequest{
		UserID:   userID,
		Algorithm: types.AlgorithmPopular,
		Limit:    limit,
		MinFame:  &minFame,
	}
	return s.algorithmService.RunMatchingAlgorithm(request)
}

// ValidateUser checks if a user exists
func (s *MatchService) ValidateUser(userID int) error {
	return s.userService.ValidateUserExists(userID)


}