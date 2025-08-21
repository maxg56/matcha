package types


// RegisterRequest represents user registration payload
type RegisterRequest struct {
	// Required fields
	Username         string                 `json:"username" binding:"required"`
	Email            string                 `json:"email" binding:"required,email"`
	Password         string                 `json:"password" binding:"required,min=8"`
	FirstName        string                 `json:"first_name" binding:"required"`
	LastName         string                 `json:"last_name" binding:"required"`
	BirthDate        string                 `json:"birth_date" binding:"required"`
	Gender           Gender           `json:"gender" binding:"required"`
	SexPref          SexPref          `json:"sex_pref" binding:"required"`
	RelationshipType RelationshipType `json:"relationship_type" binding:"required"`

	// Optional profile fields
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
	Tags                []string `json:"tags,omitempty"`
}

// LoginRequest represents user login payload
type LoginRequest struct {
	Login    string `json:"login" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// AvailabilityRequest represents availability check payload
type AvailabilityRequest struct {
	Username string `json:"username,omitempty"`
	Email    string `json:"email,omitempty"`
}

// AvailabilityResponse represents the response structure for availability checks
type AvailabilityResponse struct {
	Status      string   `json:"status"`
	Available   bool     `json:"available"`
	Message     string   `json:"message,omitempty"`
	Suggestions []string `json:"suggestions,omitempty"`
}

// EmailVerificationRequest represents email verification request
type EmailVerificationRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// VerifyEmailRequest represents email verification code request
type VerifyEmailRequest struct {
	Email            string `json:"email" binding:"required,email"`
	VerificationCode string `json:"verification_code" binding:"required"`
}