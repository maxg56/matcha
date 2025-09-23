package handlers

// UpdateProfileRequest represents profile update payload
type UpdateProfileRequest struct {
	FirstName           *string  `json:"first_name,omitempty"`
	LastName            *string  `json:"last_name,omitempty"`
	Height              *int     `json:"height,omitempty"`
	HairColor           *string  `json:"hair_color,omitempty"`
	EyeColor            *string  `json:"eye_color,omitempty"`
	SkinColor           *string  `json:"skin_color,omitempty"`
	AlcoholConsumption  *string  `json:"alcohol_consumption,omitempty"`
	Smoking             *string  `json:"smoking,omitempty"`
	Cannabis            *string  `json:"cannabis,omitempty"`
	Drugs               *string  `json:"drugs,omitempty"`
	Pets                *string  `json:"pets,omitempty"`
	SocialActivityLevel *string  `json:"social_activity_level,omitempty"`
	SportActivity       *string  `json:"sport_activity,omitempty"`
	EducationLevel      *string  `json:"education_level,omitempty"`
	PersonalOpinion     *string  `json:"personal_opinion,omitempty"`
	Bio                 *string  `json:"bio,omitempty"`
	BirthCity           *string  `json:"birth_city,omitempty"`
	CurrentCity         *string  `json:"current_city,omitempty"`
	Job                 *string  `json:"job,omitempty"`
	Religion            *string  `json:"religion,omitempty"`
	ChildrenStatus      *string  `json:"children_status,omitempty"`
	ChildrenDetails     *string  `json:"children_details,omitempty"`
	ZodiacSign          *string  `json:"zodiac_sign,omitempty"`
	PoliticalView       *string  `json:"political_view,omitempty"`
	Gender              *string  `json:"gender,omitempty"`
	SexPref             *string  `json:"sex_pref,omitempty"`
	Tags                []string `json:"tags,omitempty"`
}

// Location-related types

// LocationUpdateRequest represents location update payload
type LocationUpdateRequest struct {
	Latitude  float64 `json:"latitude" binding:"required,min=-90,max=90"`
	Longitude float64 `json:"longitude" binding:"required,min=-180,max=180"`
	City      *string `json:"city,omitempty"`
	Country   *string `json:"country,omitempty"`
}

// NearbyUserResponse represents a nearby user with distance
type NearbyUserResponse struct {
	ID                 uint      `json:"id"`
	Username           string    `json:"username"`
	FirstName          string    `json:"first_name"`
	Age                int       `json:"age"`
	Bio                string    `json:"bio"`
	Images             []string  `json:"images,omitempty"`
	Tags               []string  `json:"tags,omitempty"`
	CurrentCity        *string   `json:"current_city,omitempty"`
	Latitude           float64   `json:"latitude"`
	Longitude          float64   `json:"longitude"`
	Distance           float64   `json:"distance"`
	CompatibilityScore *float64  `json:"compatibility_score,omitempty"`
}

// UserLocation represents location data
type UserLocation struct {
	ID        uint    `json:"id"`
	UserID    uint    `json:"user_id"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	City      *string `json:"city,omitempty"`
	Country   *string `json:"country,omitempty"`
	UpdatedAt string  `json:"updated_at"`
}
