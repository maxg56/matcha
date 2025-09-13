package services

// MatchResult represents the result of a matching operation with full profile data
type MatchResult struct {
	ID                 int      `json:"id"`
	Username           string   `json:"username"`
	FirstName          string   `json:"first_name"`
	Age                int      `json:"age"`
	Bio                string   `json:"bio"`
	Fame               int      `json:"fame"`
	AlgorithmType      string   `json:"algorithm_type"`
	CompatibilityScore *float64 `json:"compatibility_score,omitempty"`
	Distance           *float64 `json:"distance,omitempty"`
}

// MatchCandidate represents a simplified matching result with only essential data
type MatchCandidate struct {
	ID                 int      `json:"id"`
	AlgorithmType      string   `json:"algorithm_type"`
	CompatibilityScore *float64 `json:"compatibility_score,omitempty"`
	Distance           *float64 `json:"distance,omitempty"`
}

// AgeRange represents an age filter range
type AgeRange struct {
	Min int `json:"min"`
	Max int `json:"max"`
}

// MatchService provides high-level matching operations using specialized services
type MatchService struct {
	userService        *UserService
	interactionService *InteractionService
	algorithmService   *AlgorithmService
}

// NewMatchService creates a new MatchService with all dependencies
func NewMatchService() *MatchService {
	return &MatchService{
		userService:        NewUserService(),
		interactionService: NewInteractionService(),
		algorithmService:   NewAlgorithmService(),
	}
}

// GetUserMatches retrieves active matches for a user
func (s *MatchService) GetUserMatches(userID int) ([]MatchResult, error) {
	return s.userService.GetUserMatches(userID)
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
func (s *MatchService) RunMatchingAlgorithm(userID int, algorithmType string, limit int, maxDistance *int, ageRange *AgeRange) ([]MatchResult, error) {
	request := BuildMatchingRequest(userID, algorithmType, limit, maxDistance, ageRange)
	return s.algorithmService.RunMatchingAlgorithm(request)
}

// GetMatchingCandidates executes the specified matching algorithm and returns only user IDs with scores
func (s *MatchService) GetMatchingCandidates(userID int, algorithmType string, limit int, maxDistance *int, ageRange *AgeRange) ([]MatchCandidate, error) {
	request := BuildMatchingRequest(userID, algorithmType, limit, maxDistance, ageRange)
	return s.algorithmService.GetMatchingCandidates(request)
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
func (s *MatchService) GetAvailableAlgorithms() []AlgorithmInfo {
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
func (s *MatchService) GetNearbyUsers(userID int, maxDistanceKm int, limit int) ([]MatchResult, error) {
	request := &MatchingRequest{
		UserID:      userID,
		Algorithm:   AlgorithmProximity,
		Limit:       limit,
		MaxDistance: &maxDistanceKm,
	}
	return s.algorithmService.RunMatchingAlgorithm(request)
}

// GetRandomMatches returns random compatible users
func (s *MatchService) GetRandomMatches(userID int, limit int) ([]MatchResult, error) {
	request := &MatchingRequest{
		UserID:    userID,
		Algorithm: AlgorithmRandom,
		Limit:     limit,
	}
	return s.algorithmService.RunMatchingAlgorithm(request)
}

// GetNewUsers returns recently joined users
func (s *MatchService) GetNewUsers(userID int, limit int, daysBack int) ([]MatchResult, error) {
	request := &MatchingRequest{
		UserID:   userID,
		Algorithm: AlgorithmNewUsers,
		Limit:    limit,
		DaysBack: &daysBack,
	}
	return s.algorithmService.RunMatchingAlgorithm(request)
}

// GetPopularUsers returns users with high fame ratings
func (s *MatchService) GetPopularUsers(userID int, limit int, minFame int) ([]MatchResult, error) {
	request := &MatchingRequest{
		UserID:   userID,
		Algorithm: AlgorithmPopular,
		Limit:    limit,
		MinFame:  &minFame,
	}
	return s.algorithmService.RunMatchingAlgorithm(request)
}

// ValidateUser checks if a user exists
func (s *MatchService) ValidateUser(userID int) error {
	return s.userService.ValidateUserExists(userID)
}

// ReceivedLike represents a like received by a user
type ReceivedLike struct {
	ID           int         `json:"id"`
	UserID       int         `json:"user_id"`
	TargetUserID int         `json:"target_user_id"`
	UserProfile  MatchResult `json:"user_profile"`
	CreatedAt    string      `json:"created_at"`
	IsMutual     bool        `json:"is_mutual"`
}

// ReceivedLikePreview represents a blurred preview for free users
type ReceivedLikePreview struct {
	ID                string `json:"id"`
	CreatedAt         string `json:"created_at"`
	BlurredImage      string `json:"blurred_image"`
	TimestampRelative string `json:"timestamp_relative"`
}

// LikeStats represents statistics about received likes
type LikeStats struct {
	TotalLikesReceived   int     `json:"total_likes_received"`
	LikesToday          int     `json:"likes_today"`
	LikesThisWeek       int     `json:"likes_this_week"`
	LikesThisMonth      int     `json:"likes_this_month"`
	MostLikedPhoto      *string `json:"most_liked_photo,omitempty"`
	LikeRateTrend       string  `json:"like_rate_trend"`
	AverageLikesPerDay  float64 `json:"average_likes_per_day"`
}

// GetReceivedLikes returns all likes received by a user (Premium feature)
func (s *MatchService) GetReceivedLikes(userID int) ([]ReceivedLike, error) {
	return s.interactionService.GetReceivedLikes(userID)
}

// GetReceivedLikesPreview returns limited preview of received likes
func (s *MatchService) GetReceivedLikesPreview(userID int, limit int) ([]ReceivedLikePreview, error) {
	return s.interactionService.GetReceivedLikesPreview(userID, limit)
}

// GetLikeStats returns statistics about likes received by the user
func (s *MatchService) GetLikeStats(userID int) (*LikeStats, error) {
	return s.interactionService.GetLikeStats(userID)
}