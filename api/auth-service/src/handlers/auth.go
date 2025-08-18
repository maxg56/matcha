package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	db "auth-service/src/conf"
	models "auth-service/src/models"
	"auth-service/src/services"
	"auth-service/src/types"
	"auth-service/src/utils"
)


// CheckAvailabilityHandler handles username/email availability checks
func CheckAvailabilityHandler(c *gin.Context) {
	var req types.AvailabilityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid payload: "+err.Error())
		return
	}

	// At least one field must be provided
	if req.Username == "" && req.Email == "" {
		utils.RespondError(c, http.StatusBadRequest, "either username or email must be provided")
		return
	}

	// Check username availability
	if req.Username != "" {
		available, err := utils.CheckUsernameAvailability(req.Username)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, err.Error())
			return
		}
		
		if !available {
			suggestions := utils.GenerateUsernameSuggestions(req.Username)
			response := types.AvailabilityResponse{
				Status:      "error",
				Available:   false,
				Message:     "Nom d'utilisateur déjà utilisé",
				Suggestions: suggestions,
			}
			c.JSON(http.StatusConflict, response)
			return
		}
	}

	// Check email availability
	if req.Email != "" {
		available, err := utils.CheckEmailAvailability(req.Email)
		if err != nil {
			utils.RespondError(c, http.StatusInternalServerError, err.Error())
			return
		}
		
		if !available {
			response := types.AvailabilityResponse{
				Status:    "error",
				Available: false,
				Message:   "Email déjà utilisé",
			}
			c.JSON(http.StatusConflict, response)
			return
		}
	}

	// Both fields are available
	response := types.AvailabilityResponse{
		Status:    "success",
		Available: true,
	}
	c.JSON(http.StatusOK, response)
}

// RegisterHandler handles user registration
func RegisterHandler(c *gin.Context) {
	var req types.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid payload: "+err.Error())
		return
	}

	// Check username uniqueness
	usernameAvailable, err := utils.CheckUsernameAvailability(req.Username)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, err.Error())
		return
	}
	if !usernameAvailable {
		suggestions := utils.GenerateUsernameSuggestions(req.Username)
		utils.RespondError(c, http.StatusConflict, "Nom d'utilisateur déjà utilisé. Suggestions: "+strings.Join(suggestions, ", "))
		return
	}

	// Check email uniqueness
	emailAvailable, err := utils.CheckEmailAvailability(req.Email)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, err.Error())
		return
	}
	if !emailAvailable {
		utils.RespondError(c, http.StatusConflict, "Email déjà utilisé")
		return
	}

	// Create user
	user, err := services.CreateUser(req)
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
	var req types.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid payload: "+err.Error())
		return
	}

	// Find user by username or email
	var user models.Users
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

