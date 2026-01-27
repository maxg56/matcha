package models

import (
	"database/sql"
	"time"
)

// User is the unified user model shared across all services
// Note: Relationships (Tags, Images) are service-specific and should be
// defined in individual service models that embed this struct
type User struct {
	ID            uint          `gorm:"primaryKey;column:id" json:"id"`
	Username      string        `gorm:"column:username;type:varchar(255);uniqueIndex;not null" json:"username"`
	FirstName     string        `gorm:"column:first_name;not null" json:"first_name"`
	LastName      string        `gorm:"column:last_name;not null" json:"last_name"`
	Email         string        `gorm:"column:email;uniqueIndex;not null" json:"email"`
	EmailVerified bool          `gorm:"column:email_verified;default:false" json:"email_verified"`
	PasswordHash  string        `gorm:"column:password_hash;not null" json:"-"`
	BirthDate     time.Time     `gorm:"column:birth_date;not null" json:"birth_date"`
	Age           int           `gorm:"column:age" json:"age"`
	Height        sql.NullInt64 `gorm:"column:height" json:"height"`
	Premium       sql.NullTime  `gorm:"column:premium;default:CURRENT_TIMESTAMP" json:"premium"`

	// Lifestyle
	AlcoholConsumption sql.NullString `gorm:"column:alcohol_consumption" json:"alcohol_consumption"`
	Smoking            sql.NullString `gorm:"column:smoking" json:"smoking"`
	Cannabis           sql.NullString `gorm:"column:cannabis" json:"cannabis"`
	Drugs              sql.NullString `gorm:"column:drugs" json:"drugs"`
	Pets               sql.NullString `gorm:"column:pets" json:"pets"`

	// Activity & Education
	SocialActivityLevel sql.NullString `gorm:"column:social_activity_level" json:"social_activity_level"`
	SportActivity       sql.NullString `gorm:"column:sport_activity" json:"sport_activity"`
	EducationLevel      sql.NullString `gorm:"column:education_level" json:"education_level"`

	// Bio & Opinion
	PersonalOpinion sql.NullString `gorm:"column:personal_opinion" json:"personal_opinion"`
	Bio             string         `gorm:"column:bio;size:400" json:"bio"`

	// Location & Work
	BirthCity        sql.NullString `gorm:"column:birth_city" json:"birth_city"`
	CurrentCity      sql.NullString `gorm:"column:current_city" json:"current_city"`
	Job              sql.NullString `gorm:"column:job" json:"job"`
	Religion         sql.NullString `gorm:"column:religion" json:"religion"`
	RelationshipType string         `gorm:"column:relationship_type;not null" json:"relationship_type"`
	ChildrenStatus   sql.NullString `gorm:"column:children_status" json:"children_status"`
	ChildrenDetails  sql.NullString `gorm:"column:children_details" json:"children_details"`

	// Appearance
	ZodiacSign sql.NullString `gorm:"column:zodiac_sign" json:"zodiac_sign"`
	HairColor  sql.NullString `gorm:"column:hair_color" json:"hair_color"`
	SkinColor  sql.NullString `gorm:"column:skin_color" json:"skin_color"`
	EyeColor   sql.NullString `gorm:"column:eye_color" json:"eye_color"`

	// Matching & Preferences
	Fame    int    `gorm:"column:fame;default:0" json:"fame"`
	Gender  string `gorm:"column:gender;not null" json:"gender"`
	SexPref string `gorm:"column:sex_pref;not null;default:both" json:"sex_pref"`

	// Politics & Location
	PoliticalView sql.NullString  `gorm:"column:political_view" json:"political_view"`
	Latitude      sql.NullFloat64 `gorm:"column:latitude" json:"latitude"`
	Longitude     sql.NullFloat64 `gorm:"column:longitude" json:"longitude"`

	// Timestamps
	CreatedAt time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
}

// TableName specifies the table name for GORM
func (User) TableName() string {
	return "users"
}

// PublicProfile returns a safe version of user data for public viewing
type PublicProfile struct {
	ID                  uint      `json:"id"`
	Username            string    `json:"username"`
	FirstName           string    `json:"first_name"`
	LastName            string    `json:"last_name"`
	Age                 int       `json:"age"`
	Height              *int      `json:"height,omitempty"`
	AlcoholConsumption  *string   `json:"alcohol_consumption,omitempty"`
	Smoking             *string   `json:"smoking,omitempty"`
	Cannabis            *string   `json:"cannabis,omitempty"`
	Drugs               *string   `json:"drugs,omitempty"`
	Pets                *string   `json:"pets,omitempty"`
	SocialActivityLevel *string   `json:"social_activity_level,omitempty"`
	SportActivity       *string   `json:"sport_activity,omitempty"`
	EducationLevel      *string   `json:"education_level,omitempty"`
	PersonalOpinion     *string   `json:"personal_opinion,omitempty"`
	Bio                 string    `json:"bio"`
	BirthCity           *string   `json:"birth_city,omitempty"`
	CurrentCity         *string   `json:"current_city,omitempty"`
	Job                 *string   `json:"job,omitempty"`
	Religion            *string   `json:"religion,omitempty"`
	RelationshipType    string    `json:"relationship_type"`
	ChildrenStatus      *string   `json:"children_status,omitempty"`
	ZodiacSign          *string   `json:"zodiac_sign,omitempty"`
	HairColor           *string   `json:"hair_color,omitempty"`
	SkinColor           *string   `json:"skin_color,omitempty"`
	EyeColor            *string   `json:"eye_color,omitempty"`
	Fame                int       `json:"fame"`
	Gender              string    `json:"gender"`
	SexPref             string    `json:"sex_pref"`
	PoliticalView       *string   `json:"political_view,omitempty"`
	CreatedAt           time.Time `json:"created_at"`
}

// ToPublicProfile converts User to PublicProfile
func (u *User) ToPublicProfile() *PublicProfile {
	profile := &PublicProfile{
		ID:               u.ID,
		Username:         u.Username,
		FirstName:        u.FirstName,
		LastName:         u.LastName,
		Age:              u.Age,
		Bio:              u.Bio,
		RelationshipType: u.RelationshipType,
		Fame:             u.Fame,
		Gender:           u.Gender,
		SexPref:          u.SexPref,
		CreatedAt:        u.CreatedAt,
	}

	// Handle nullable fields
	if u.Height.Valid {
		height := int(u.Height.Int64)
		profile.Height = &height
	}

	if u.AlcoholConsumption.Valid {
		profile.AlcoholConsumption = &u.AlcoholConsumption.String
	}
	if u.Smoking.Valid {
		profile.Smoking = &u.Smoking.String
	}
	if u.Cannabis.Valid {
		profile.Cannabis = &u.Cannabis.String
	}
	if u.Drugs.Valid {
		profile.Drugs = &u.Drugs.String
	}
	if u.Pets.Valid {
		profile.Pets = &u.Pets.String
	}
	if u.SocialActivityLevel.Valid {
		profile.SocialActivityLevel = &u.SocialActivityLevel.String
	}
	if u.SportActivity.Valid {
		profile.SportActivity = &u.SportActivity.String
	}
	if u.EducationLevel.Valid {
		profile.EducationLevel = &u.EducationLevel.String
	}
	if u.PersonalOpinion.Valid {
		profile.PersonalOpinion = &u.PersonalOpinion.String
	}
	if u.BirthCity.Valid {
		profile.BirthCity = &u.BirthCity.String
	}
	if u.CurrentCity.Valid {
		profile.CurrentCity = &u.CurrentCity.String
	}
	if u.Job.Valid {
		profile.Job = &u.Job.String
	}
	if u.Religion.Valid {
		profile.Religion = &u.Religion.String
	}
	if u.ChildrenStatus.Valid {
		profile.ChildrenStatus = &u.ChildrenStatus.String
	}
	if u.ZodiacSign.Valid {
		profile.ZodiacSign = &u.ZodiacSign.String
	}
	if u.HairColor.Valid {
		profile.HairColor = &u.HairColor.String
	}
	if u.SkinColor.Valid {
		profile.SkinColor = &u.SkinColor.String
	}
	if u.EyeColor.Valid {
		profile.EyeColor = &u.EyeColor.String
	}
	if u.PoliticalView.Valid {
		profile.PoliticalView = &u.PoliticalView.String
	}

	return profile
}
