package types

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

// AlgorithmType represents different matching algorithm types
type AlgorithmType string

const (
	AlgorithmVectorBased     AlgorithmType = "vector_based"
	AlgorithmEnhancedVector  AlgorithmType = "enhanced_vector"
	AlgorithmBasicCompatibility AlgorithmType = "basic_compatibility"
	AlgorithmProximity       AlgorithmType = "proximity"
	AlgorithmRandom          AlgorithmType = "random"
	AlgorithmNewUsers        AlgorithmType = "new_users"
	AlgorithmPopular         AlgorithmType = "popular"
)

// MatchingRequest encapsulates all parameters for a matching request
type MatchingRequest struct {
	UserID      int        `json:"user_id"`
	Algorithm   AlgorithmType `json:"algorithm"`
	Limit       int        `json:"limit"`
	MaxDistance *int       `json:"max_distance,omitempty"`
	AgeRange    *AgeRange  `json:"age_range,omitempty"`
	MinFame     *int       `json:"min_fame,omitempty"`
	DaysBack    *int       `json:"days_back,omitempty"`
}

// AlgorithmInfo provides metadata about a matching algorithm
type AlgorithmInfo struct {
	Type           AlgorithmType `json:"type"`
	Name           string        `json:"name"`
	Description    string        `json:"description"`
	RequiredParams []string      `json:"required_params"`
	OptionalParams []string      `json:"optional_params"`
	Cacheable      bool          `json:"cacheable"`
}

// ReceivedLike represents a received like with full user profile (Premium feature)
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