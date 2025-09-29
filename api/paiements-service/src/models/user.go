package models

import (
	"database/sql"
	"time"
)

type User struct {
	ID           uint          `gorm:"primaryKey;column:id" json:"id"`
	Username     string        `gorm:"column:username;uniqueIndex;not null" json:"username"`
	FirstName    string        `gorm:"column:first_name;not null" json:"first_name"`
	LastName     string        `gorm:"column:last_name;not null" json:"last_name"`
	Email         string        `gorm:"column:email;uniqueIndex;not null" json:"email"`
	EmailVerified bool          `gorm:"column:email_verified;default:false" json:"email_verified"`
	PasswordHash  string        `gorm:"column:password_hash;not null" json:"-"`
	BirthDate    time.Time     `gorm:"column:birth_date;not null" json:"birth_date"`
	Age          int           `gorm:"column:age" json:"age"`
	Height       sql.NullInt64 `gorm:"column:height" json:"height"`
	Premium      sql.NullTime  `gorm:"column:premium;default:CURRENT_TIMESTAMP" json:"premium"`

	AlcoholConsumption sql.NullString `gorm:"column:alcohol_consumption" json:"alcohol_consumption"`
	Smoking            sql.NullString `gorm:"column:smoking" json:"smoking"`
	Cannabis           sql.NullString `gorm:"column:cannabis" json:"cannabis"`
	Drugs              sql.NullString `gorm:"column:drugs" json:"drugs"`
	Pets               sql.NullString `gorm:"column:pets" json:"pets"`

	SocialActivityLevel sql.NullString `gorm:"column:social_activity_level" json:"social_activity_level"`
	SportActivity       sql.NullString `gorm:"column:sport_activity" json:"sport_activity"`
	EducationLevel      sql.NullString `gorm:"column:education_level" json:"education_level"`

	PersonalOpinion sql.NullString `gorm:"column:personal_opinion" json:"personal_opinion"`
	Bio             string         `gorm:"column:bio;size:400" json:"bio"`

	BirthCity        sql.NullString `gorm:"column:birth_city" json:"birth_city"`
	CurrentCity      sql.NullString `gorm:"column:current_city" json:"current_city"`
	Job              sql.NullString `gorm:"column:job" json:"job"`
	Religion         sql.NullString `gorm:"column:religion" json:"religion"`
	RelationshipType string         `gorm:"column:relationship_type;not null" json:"relationship_type"`
	ChildrenStatus   sql.NullString `gorm:"column:children_status" json:"children_status"`
	ChildrenDetails  sql.NullString `gorm:"column:children_details" json:"children_details"`

	ZodiacSign sql.NullString `gorm:"column:zodiac_sign" json:"zodiac_sign"`

	HairColor sql.NullString `gorm:"column:hair_color" json:"hair_color"`
	SkinColor sql.NullString `gorm:"column:skin_color" json:"skin_color"`
	EyeColor  sql.NullString `gorm:"column:eye_color" json:"eye_color"`

	Fame    int    `gorm:"column:fame;default:0" json:"fame"`
	Gender  string `gorm:"column:gender;not null" json:"gender"`
	SexPref string `gorm:"column:sex_pref;not null;default:both" json:"sex_pref"`

	PoliticalView sql.NullString `gorm:"column:political_view" json:"political_view"`

	Latitude  sql.NullFloat64 `gorm:"column:latitude" json:"latitude"`
	Longitude sql.NullFloat64 `gorm:"column:longitude" json:"longitude"`
	CreatedAt time.Time       `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time       `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`

}

func (User) TableName() string {
	return "users"
}