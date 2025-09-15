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
	Tags                []string `json:"tags,omitempty"`
}
