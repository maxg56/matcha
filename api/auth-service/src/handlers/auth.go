package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	db "auth-service/src/conf"
	models "auth-service/src/models"
	types "auth-service/src/types"
	"auth-service/src/utils"
)

// RegisterRequest represents user registration payload
type RegisterRequest struct {
	// Required fields
	Username         string                 `json:"username" binding:"required"`
	Email            string                 `json:"email" binding:"required,email"`
	Password         string                 `json:"password" binding:"required,min=8"`
	FirstName        string                 `json:"first_name" binding:"required"`
	LastName         string                 `json:"last_name" binding:"required"`
	BirthDate        string                 `json:"birth_date" binding:"required"`
	Gender           types.Gender           `json:"gender" binding:"required"`
	SexPref          types.SexPref          `json:"sex_pref" binding:"required"`
	RelationshipType types.RelationshipType `json:"relationship_type" binding:"required"`
	
	// Optional profile fields
	Height               *int    `json:"height,omitempty"`
	HairColor           *string `json:"hair_color,omitempty"`
	EyeColor            *string `json:"eye_color,omitempty"`
	SkinColor           *string `json:"skin_color,omitempty"`
	AlcoholConsumption  *string `json:"alcohol_consumption,omitempty"`
	Smoking             *string `json:"smoking,omitempty"`
	Cannabis            *string `json:"cannabis,omitempty"`
	Drugs               *string `json:"drugs,omitempty"`
	Pets                *string `json:"pets,omitempty"`
	SocialActivityLevel *string `json:"social_activity_level,omitempty"`
	SportActivity       *string `json:"sport_activity,omitempty"`
	EducationLevel      *string `json:"education_level,omitempty"`
	PersonalOpinion     *string `json:"personal_opinion,omitempty"`
	Bio                 *string `json:"bio,omitempty"`
	BirthCity           *string `json:"birth_city,omitempty"`
	CurrentCity         *string `json:"current_city,omitempty"`
	Job                 *string `json:"job,omitempty"`
	Religion            *string `json:"religion,omitempty"`
	ChildrenStatus      *string `json:"children_status,omitempty"`
	ChildrenDetails     *string `json:"children_details,omitempty"`
	ZodiacSign          *string `json:"zodiac_sign,omitempty"`
	PoliticalView       *string `json:"political_view,omitempty"`
	Tags                []string `json:"tags,omitempty"` // Array of interest tags
}

// LoginRequest represents user login payload
type LoginRequest struct {
	Login    string `json:"login" binding:"required"` // username or email
	Password string `json:"password" binding:"required"`
}

// RegisterHandler handles user registration
func RegisterHandler(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid payload: "+err.Error())
		return
	}

	// Check for existing users
	var existing models.User
	if err := db.DB.Where("username = ? OR email = ?", req.Username, req.Email).First(&existing).Error; err == nil && existing.ID != 0 {
		utils.RespondError(c, http.StatusConflict, "username or email already in use")
		return
	}

	// Create user
	user, err := createUser(req)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Generate tokens
	tokens, err := utils.GenerateTokenPair(user.ID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespondSuccess(c, http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
		"access_token":  tokens.AccessToken,
		"refresh_token": tokens.RefreshToken,
		"token_type":    "Bearer",
		"expires_in":    tokens.ExpiresIn,
	})
}

// LoginHandler handles user login
func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid payload: "+err.Error())
		return
	}

	// Find user by username or email
	var user models.User
	if err := db.DB.Where("username = ? OR email = ?", req.Login, req.Login).First(&user).Error; err != nil || user.ID == 0 {
		utils.RespondError(c, http.StatusUnauthorized, "invalid credentials")
		return
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "invalid credentials")
		return
	}

	// Issue JWT & refresh tokens
	tokens, err := utils.GenerateTokenPair(user.ID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "Login successful",
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
		"access_token":  tokens.AccessToken,
		"refresh_token": tokens.RefreshToken,
		"token_type":    "Bearer",
		"expires_in":    tokens.ExpiresIn,
	})
}

// createUser creates a new user in the database with full profile
func createUser(req RegisterRequest) (*models.User, error) {
	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to process password")
	}

	// Parse birth date
	birthDate, err := parseDate(req.BirthDate)
	if err != nil {
		return nil, fmt.Errorf("invalid birth date format: %w", err)
	}

	// Calculate age
	age := calculateAge(birthDate)

	user := models.User{
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

	// Start transaction to create user and tags
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

	// Create user tags if provided
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

// parseDate parses date string in YYYY-MM-DD format
func parseDate(dateStr string) (time.Time, error) {
	return time.Parse("2006-01-02", dateStr)
}

// calculateAge calculates age from birth date
func calculateAge(birthDate time.Time) int {
	now := time.Now()
	age := now.Year() - birthDate.Year()
	if now.YearDay() < birthDate.YearDay() {
		age--
	}
	return age
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
		// Find or create tag
		var tag models.Tag
		if err := tx.Where("name = ?", tagName).FirstOrCreate(&tag, models.Tag{Name: tagName}).Error; err != nil {
			return fmt.Errorf("failed to create tag %s: %w", tagName, err)
		}

		// Create user_tag association
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
