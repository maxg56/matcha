package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	db "auth-service/src/conf"
	models "auth-service/src/models"
	types "auth-service/src/types"
	"auth-service/src/utils"
)

// RegisterRequest represents user registration payload
type RegisterRequest struct {
	Username  string        `json:"username" binding:"required"`
	Email     string        `json:"email" binding:"required,email"`
	Password  string        `json:"password" binding:"required,min=8"`
	FirstName string        `json:"first_name" binding:"required"`
	LastName  string        `json:"last_name" binding:"required"`
	BirthDate string        `json:"birth_date" binding:"required"`
	Gender    types.Gender  `json:"gender" binding:"required"`
	SexPref   types.SexPref `json:"sex_pref" binding:"required"`
}

// LoginRequest represents user login payload
type LoginRequest struct {
	Login    string `json:"login" binding:"required"`    // username or email
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
		"message":       "User registered successfully",
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

// createUser creates a new user in the database
func createUser(req RegisterRequest) (*models.User, error) {
	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to process password")
	}

	// Note: birth_date handling can be added when the User model includes it

	user := models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hash),
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Gender:       string(req.Gender),
		SexPref:      string(req.SexPref),
	}

	if err := db.DB.Create(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &user, nil
}