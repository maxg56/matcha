package utils

import (
	"encoding/json"
	"math"
	"match-service/src/models"
)

// UserVector represents a user as a multi-dimensional vector
type UserVector struct {
	UserID              uint      `json:"user_id"`
	Age                 float64   `json:"age"`                   // Normalized 0-1
	Height              float64   `json:"height"`                // Normalized 0-1
	Fame                float64   `json:"fame"`                  // Normalized 0-1
	AlcoholConsumption  float64   `json:"alcohol_consumption"`   // Encoded 0-1
	Smoking             float64   `json:"smoking"`               // Encoded 0-1
	Cannabis            float64   `json:"cannabis"`              // Encoded 0-1
	Drugs               float64   `json:"drugs"`                 // Encoded 0-1
	Pets                float64   `json:"pets"`                  // Encoded 0-1
	SocialActivityLevel float64   `json:"social_activity_level"` // Encoded 0-1
	SportActivity       float64   `json:"sport_activity"`        // Encoded 0-1
	EducationLevel      float64   `json:"education_level"`       // Encoded 0-1
	Religion            float64   `json:"religion"`              // Encoded 0-1
	ChildrenStatus      float64   `json:"children_status"`       // Encoded 0-1
	PoliticalView       float64   `json:"political_view"`        // Encoded 0-1
	Latitude            float64   `json:"latitude"`              // Normalized 0-1
	Longitude           float64   `json:"longitude"`             // Normalized 0-1
}

// PreferenceVector represents learned user preferences
type PreferenceVector struct {
	UserID      uint        `json:"user_id"`
	Vector      UserVector  `json:"vector"`
	UpdateCount int         `json:"update_count"`
}

// CompatibilityScore represents the result of matching algorithm
type CompatibilityScore struct {
	UserID             uint                   `json:"user_id"`
	CompatibilityScore float64                `json:"compatibility_score"`
	Distance           float64                `json:"distance_km"`
	AgeDifference      int                    `json:"age_difference"`
	Factors            map[string]interface{} `json:"factors"`
}

// MarshalJSON implements custom JSON marshaling for CompatibilityScore
func (c CompatibilityScore) MarshalJSON() ([]byte, error) {
	type Alias CompatibilityScore
	return json.Marshal(&struct {
		*Alias
	}{
		Alias: (*Alias)(&c),
	})
}

// UnmarshalJSON implements custom JSON unmarshaling for CompatibilityScore
func (c *CompatibilityScore) UnmarshalJSON(data []byte) error {
	type Alias CompatibilityScore
	aux := &struct {
		*Alias
	}{
		Alias: (*Alias)(c),
	}
	return json.Unmarshal(data, &aux)
}

// UserToVector converts a User model to a normalized vector
func UserToVector(user *models.User) UserVector {
	vector := UserVector{
		UserID: user.ID,
	}

	// Normalize age (18-80 years)
	if user.Age > 0 {
		vector.Age = math.Max(0, math.Min(1, float64(user.Age-18)/62.0))
	}

	// Normalize height (140-220cm)
	if user.Height.Valid {
		vector.Height = math.Max(0, math.Min(1, float64(user.Height.Int64-140)/80.0))
	}

	// Normalize fame (0-100)
	vector.Fame = math.Max(0, math.Min(1, float64(user.Fame)/100.0))

	// Encode lifestyle attributes
	vector.AlcoholConsumption = encodeLifestyleAttribute(user.AlcoholConsumption.String)
	vector.Smoking = encodeLifestyleAttribute(user.Smoking.String)
	vector.Cannabis = encodeLifestyleAttribute(user.Cannabis.String)
	vector.Drugs = encodeLifestyleAttribute(user.Drugs.String)
	vector.Pets = encodeLifestyleAttribute(user.Pets.String)
	vector.SocialActivityLevel = encodeLifestyleAttribute(user.SocialActivityLevel.String)
	vector.SportActivity = encodeLifestyleAttribute(user.SportActivity.String)
	vector.EducationLevel = encodeLifestyleAttribute(user.EducationLevel.String)
	vector.Religion = encodeLifestyleAttribute(user.Religion.String)
	vector.ChildrenStatus = encodeLifestyleAttribute(user.ChildrenStatus.String)
	vector.PoliticalView = encodeLifestyleAttribute(user.PoliticalView.String)

	// Normalize coordinates (-180 to 180 for longitude, -90 to 90 for latitude)
	if user.Latitude.Valid {
		vector.Latitude = (user.Latitude.Float64 + 90) / 180.0
	}
	if user.Longitude.Valid {
		vector.Longitude = (user.Longitude.Float64 + 180) / 360.0
	}

	return vector
}

// encodeLifestyleAttribute converts lifestyle string to normalized float
func encodeLifestyleAttribute(value string) float64 {
	switch value {
	case "never", "no", "none", "low":
		return 0.0
	case "rarely", "sometimes", "light", "moderate":
		return 0.33
	case "occasionally", "socially", "medium":
		return 0.66
	case "frequently", "regularly", "often", "high", "heavy":
		return 1.0
	default:
		return 0.5 // neutral/unknown
	}
}

// CosineSimilarity calculates cosine similarity between two vectors
func CosineSimilarity(v1, v2 UserVector) float64 {
	dotProduct := 0.0
	magnitude1 := 0.0
	magnitude2 := 0.0

	values1 := vectorToSlice(v1)
	values2 := vectorToSlice(v2)

	for i := 0; i < len(values1); i++ {
		dotProduct += values1[i] * values2[i]
		magnitude1 += values1[i] * values1[i]
		magnitude2 += values2[i] * values2[i]
	}

	if magnitude1 == 0 || magnitude2 == 0 {
		return 0
	}

	return dotProduct / (math.Sqrt(magnitude1) * math.Sqrt(magnitude2))
}

// WeightedSimilarity calculates weighted similarity with custom weights
func WeightedSimilarity(v1, v2 UserVector, weights map[string]float64) float64 {
	similarity := 0.0
	totalWeight := 0.0

	// Define default weights if not provided
	if weights == nil {
		weights = map[string]float64{
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
		}
	}

	// Calculate weighted similarities for each attribute
	attributes := map[string][2]float64{
		"age":                   {v1.Age, v2.Age},
		"height":                {v1.Height, v2.Height},
		"fame":                  {v1.Fame, v2.Fame},
		"alcohol_consumption":   {v1.AlcoholConsumption, v2.AlcoholConsumption},
		"smoking":               {v1.Smoking, v2.Smoking},
		"cannabis":              {v1.Cannabis, v2.Cannabis},
		"drugs":                 {v1.Drugs, v2.Drugs},
		"pets":                  {v1.Pets, v2.Pets},
		"social_activity_level": {v1.SocialActivityLevel, v2.SocialActivityLevel},
		"sport_activity":        {v1.SportActivity, v2.SportActivity},
		"education_level":       {v1.EducationLevel, v2.EducationLevel},
		"religion":              {v1.Religion, v2.Religion},
	}

	for attr, values := range attributes {
		if weight, exists := weights[attr]; exists {
			// Calculate similarity for this attribute (1 - absolute difference)
			attrSimilarity := 1.0 - math.Abs(values[0]-values[1])
			similarity += attrSimilarity * weight
			totalWeight += weight
		}
	}

	if totalWeight > 0 {
		return similarity / totalWeight
	}
	return 0
}

// HaversineDistance calculates geographic distance between two points
func HaversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371 // Earth's radius in kilometers

	lat1Rad := lat1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	deltaLat := (lat2 - lat1) * math.Pi / 180
	deltaLon := (lon2 - lon1) * math.Pi / 180

	a := math.Sin(deltaLat/2)*math.Sin(deltaLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
		math.Sin(deltaLon/2)*math.Sin(deltaLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}

// UpdatePreferenceVector updates user preferences based on interaction
func UpdatePreferenceVector(preferenceVector, targetVector UserVector, learningRate float64, isPositive bool) UserVector {
	updated := preferenceVector

	values1 := vectorToSlice(preferenceVector)
	values2 := vectorToSlice(targetVector)
	updatedValues := make([]float64, len(values1))

	for i := 0; i < len(values1); i++ {
		if isPositive {
			// Move preference vector closer to target (like)
			updatedValues[i] = values1[i] + learningRate*(values2[i]-values1[i])
		} else {
			// Move preference vector away from target (pass)
			updatedValues[i] = values1[i] - learningRate*(values2[i]-values1[i])
		}
		// Clamp values between 0 and 1
		updatedValues[i] = math.Max(0, math.Min(1, updatedValues[i]))
	}

	return sliceToVector(updatedValues, updated.UserID)
}

// vectorToSlice converts UserVector to slice for calculations
func vectorToSlice(v UserVector) []float64 {
	return []float64{
		v.Age, v.Height, v.Fame,
		v.AlcoholConsumption, v.Smoking, v.Cannabis, v.Drugs, v.Pets,
		v.SocialActivityLevel, v.SportActivity, v.EducationLevel,
		v.Religion, v.ChildrenStatus, v.PoliticalView,
		v.Latitude, v.Longitude,
	}
}

// sliceToVector converts slice back to UserVector
func sliceToVector(values []float64, userID uint) UserVector {
	return UserVector{
		UserID:              userID,
		Age:                 values[0],
		Height:              values[1],
		Fame:                values[2],
		AlcoholConsumption:  values[3],
		Smoking:             values[4],
		Cannabis:            values[5],
		Drugs:               values[6],
		Pets:                values[7],
		SocialActivityLevel: values[8],
		SportActivity:       values[9],
		EducationLevel:      values[10],
		Religion:            values[11],
		ChildrenStatus:      values[12],
		PoliticalView:       values[13],
		Latitude:            values[14],
		Longitude:           values[15],
	}
}