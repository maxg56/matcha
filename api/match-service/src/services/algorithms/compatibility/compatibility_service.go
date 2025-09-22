package compatibility

import (
	"log"
	"math"
	"time"

	"match-service/src/models"
	"match-service/src/utils"
)

// CompatibilityService handles compatibility score calculations
type CompatibilityService struct {
	weights map[string]float64
}

// NewCompatibilityService creates a new CompatibilityService instance
func NewCompatibilityService() *CompatibilityService {
	// Define default weights for attributes
	weights := map[string]float64{
		"age":                   0.15,
		"height":                0.05,
		"fame":                  0.10,
		"alcohol_consumption":   0.08,
		"smoking":               0.12,
		"cannabis":              0.06,
		"drugs":                 0.10,
		"pets":                  0.07,
		"social_activity_level": 0.08,
		"sport_activity":        0.08,
		"education_level":       0.06,
		"religion":              0.05,
		"children_status":       0.05,
		"political_view":        0.05,
	}

	return &CompatibilityService{
		weights: weights,
	}
}

// CalculateCompatibilityScore computes compatibility between two users with caching
func (c *CompatibilityService) CalculateCompatibilityScore(userID, targetUserID int, preferenceVector, candidateVector utils.UserVector, currentUser, candidate *models.User) utils.CompatibilityScore {
	// Check cache first
	if cached, exists := utils.GetCachedCompatibilityScore(userID, targetUserID); exists {
		log.Printf("Cache hit for compatibility score between users %d and %d", userID, targetUserID)
		return cached
	}

	// Calculate the score
	score := c.computeCompatibilityScore(preferenceVector, candidateVector, currentUser, candidate)
	
	// Cache the result
	utils.CacheCompatibilityScore(userID, targetUserID, score, 10*time.Minute)
	
	return score
}

// computeCompatibilityScore performs the actual compatibility calculation
func (c *CompatibilityService) computeCompatibilityScore(preferenceVector, candidateVector utils.UserVector, currentUser, candidate *models.User) utils.CompatibilityScore {
	// Calculate weighted Euclidean distance
	var totalWeightedDistance float64
	var totalWeight float64
	factors := make(map[string]interface{})

	// Age compatibility
	ageDiff := math.Abs(preferenceVector.Age - candidateVector.Age)
	ageScore := 1.0 - ageDiff // Closer ages = higher score
	if ageScore < 0 {
		ageScore = 0
	}
	totalWeightedDistance += c.weights["age"] * (1.0 - ageScore)
	totalWeight += c.weights["age"]
	factors["age_compatibility"] = ageScore

	// Height compatibility
	heightDiff := math.Abs(preferenceVector.Height - candidateVector.Height)
	heightScore := 1.0 - heightDiff
	if heightScore < 0 {
		heightScore = 0
	}
	totalWeightedDistance += c.weights["height"] * (1.0 - heightScore)
	totalWeight += c.weights["height"]
	factors["height_compatibility"] = heightScore

	// Fame compatibility
	fameDiff := math.Abs(preferenceVector.Fame - candidateVector.Fame)
	fameScore := 1.0 - fameDiff
	if fameScore < 0 {
		fameScore = 0
	}
	totalWeightedDistance += c.weights["fame"] * (1.0 - fameScore)
	totalWeight += c.weights["fame"]
	factors["fame_compatibility"] = fameScore

	// Lifestyle compatibility factors
	lifestyleFactors := []string{
		"alcohol_consumption", "smoking", "cannabis", "drugs", "pets",
		"social_activity_level", "sport_activity", "education_level",
		"religion", "children_status", "political_view",
	}

	for _, factor := range lifestyleFactors {
		if weight, exists := c.weights[factor]; exists {
			prefValue := c.getVectorValueByName(preferenceVector, factor)
			candValue := c.getVectorValueByName(candidateVector, factor)
			
			diff := math.Abs(prefValue - candValue)
			score := 1.0 - diff
			if score < 0 {
				score = 0
			}
			
			totalWeightedDistance += weight * (1.0 - score)
			totalWeight += weight
			factors[factor+"_compatibility"] = score
		}
	}

	// Calculate overall compatibility (invert distance to get similarity)
	var compatibilityScore float64
	if totalWeight > 0 {
		averageDistance := totalWeightedDistance / totalWeight
		compatibilityScore = (1.0 - averageDistance) * 100.0 // Convert to percentage
	}

	// Ensure score is between 0 and 100
	if compatibilityScore < 0 {
		compatibilityScore = 0
	} else if compatibilityScore > 100 {
		compatibilityScore = 100
	}

	// Calculate distance if location data is available
	var distance float64
	if currentUser.Latitude.Valid && currentUser.Longitude.Valid &&
		candidate.Latitude.Valid && candidate.Longitude.Valid {
		distance = utils.HaversineDistance(
			currentUser.Latitude.Float64, currentUser.Longitude.Float64,
			candidate.Latitude.Float64, candidate.Longitude.Float64,
		)
	}

	// Calculate age difference
	ageDifference := int(math.Abs(float64(currentUser.Age - candidate.Age)))

	return utils.CompatibilityScore{
		UserID:             candidate.ID,
		CompatibilityScore: compatibilityScore,
		Distance:           distance,
		AgeDifference:      ageDifference,
		Factors:            factors,
	}
}

// getVectorValueByName extracts a value from UserVector by field name
func (c *CompatibilityService) getVectorValueByName(vector utils.UserVector, fieldName string) float64 {
	switch fieldName {
	case "age":
		return vector.Age
	case "height":
		return vector.Height
	case "fame":
		return vector.Fame
	case "alcohol_consumption":
		return vector.AlcoholConsumption
	case "smoking":
		return vector.Smoking
	case "cannabis":
		return vector.Cannabis
	case "drugs":
		return vector.Drugs
	case "pets":
		return vector.Pets
	case "social_activity_level":
		return vector.SocialActivityLevel
	case "sport_activity":
		return vector.SportActivity
	case "education_level":
		return vector.EducationLevel
	case "religion":
		return vector.Religion
	case "children_status":
		return vector.ChildrenStatus
	case "political_view":
		return vector.PoliticalView
	default:
		return 0.0
	}
}

// UpdateWeights allows dynamic adjustment of compatibility weights
func (c *CompatibilityService) UpdateWeights(newWeights map[string]float64) {
	for key, value := range newWeights {
		if _, exists := c.weights[key]; exists {
			c.weights[key] = value
		}
	}
}

// GetWeights returns current compatibility weights
func (c *CompatibilityService) GetWeights() map[string]float64 {
	weightsCopy := make(map[string]float64)
	for k, v := range c.weights {
		weightsCopy[k] = v
	}
	return weightsCopy
}