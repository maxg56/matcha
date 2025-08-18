package services

import (
	"database/sql"
	"fmt"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	db "auth-service/src/conf"
	models "auth-service/src/models"
	"auth-service/src/types"
	"auth-service/src/utils"
)

// createUser creates a new user in the database with full profile
func CreateUser(req types.RegisterRequest) (*models.Users, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to process password")
	}

	birthDate, err := utils.ParseDate(req.BirthDate)
	if err != nil {
		return nil, fmt.Errorf("invalid birth date format: %w", err)
	}

	age := utils.CalculateAge(birthDate)

	user := models.Users{
		Username:         req.Username,
		Email:            req.Email,
		PasswordHash:     string(hash),
		FirstName:        req.FirstName,
		LastName:         req.LastName,
		BirthDate:        birthDate,
		Age:              age,
		Gender:           string(req.Gender),
		SexPref:          string(req.SexPref),
		RelationshipType: string(req.RelationshipType),
	}

	// Set optional fields if provided
	if req.Height != nil {
		user.Height.Int64 = int64(*req.Height)
		user.Height.Valid = true
	}

	setNullString(&user.HairColor, req.HairColor)
	setNullString(&user.EyeColor, req.EyeColor)
	setNullString(&user.SkinColor, req.SkinColor)
	setNullString(&user.AlcoholConsumption, req.AlcoholConsumption)
	setNullString(&user.Smoking, req.Smoking)
	setNullString(&user.Cannabis, req.Cannabis)
	setNullString(&user.Drugs, req.Drugs)
	setNullString(&user.Pets, req.Pets)
	setNullString(&user.SocialActivityLevel, req.SocialActivityLevel)
	setNullString(&user.SportActivity, req.SportActivity)
	setNullString(&user.EducationLevel, req.EducationLevel)
	setNullString(&user.PersonalOpinion, req.PersonalOpinion)
	setNullString(&user.BirthCity, req.BirthCity)
	setNullString(&user.CurrentCity, req.CurrentCity)
	setNullString(&user.Job, req.Job)
	setNullString(&user.Religion, req.Religion)
	setNullString(&user.ChildrenStatus, req.ChildrenStatus)
	setNullString(&user.ChildrenDetails, req.ChildrenDetails)
	setNullString(&user.ZodiacSign, req.ZodiacSign)
	setNullString(&user.PoliticalView, req.PoliticalView)

	if req.Bio != nil {
		user.Bio = *req.Bio
	}

	tx := db.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	if len(req.Tags) > 0 {
		if err := createUserTags(tx, user.ID, req.Tags); err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create user tags: %w", err)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &user, nil
}

// setNullString sets a sql.NullString field if value is provided
func setNullString(field *sql.NullString, value *string) {
	if value != nil {
		field.String = *value
		field.Valid = true
	}
}

// createUserTags creates tags and user_tags associations
func createUserTags(tx *gorm.DB, userID uint, tagNames []string) error {
	for _, tagName := range tagNames {
		var tag models.Tag
		if err := tx.Where("name = ?", tagName).FirstOrCreate(&tag, models.Tag{Name: tagName}).Error; err != nil {
			return fmt.Errorf("failed to create tag %s: %w", tagName, err)
		}

		userTag := models.UserTag{
			UserID: userID,
			TagID:  tag.ID,
		}
		if err := tx.Create(&userTag).Error; err != nil {
			return fmt.Errorf("failed to create user_tag association: %w", err)
		}
	}
	return nil
}