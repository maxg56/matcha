package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"user-service/src/models"
	"user-service/src/conf"
	"user-service/src/services"
	"user-service/src/utils"
)

// UserSetupRequest represents the data needed to setup a new user
type UserSetupRequest struct {
	UserID  int    `json:"user_id" binding:"required"`
	Age     int    `json:"age" binding:"required"`
	SexPref string `json:"sex_pref" binding:"required"`
}

// SetupNewUserHandler creates default preferences and any other setup for a new user
func SetupNewUserHandler(c *gin.Context) {
	var req UserSetupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid payload: "+err.Error())
		return
	}

	// Validate sex_pref
	validSexPrefs := []string{"man", "woman", "both", "other"}
	isValidSexPref := false
	for _, valid := range validSexPrefs {
		if req.SexPref == valid {
			isValidSexPref = true
			break
		}
	}
	if !isValidSexPref {
		utils.RespondError(c, http.StatusBadRequest, "invalid sex_pref value")
		return
	}

	// Create default preferences
	if err := services.CreateDefaultPreferencesForUser(req.UserID, req.Age, req.SexPref); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to setup user preferences: "+err.Error())
		return
	}

	utils.RespondSuccess(c, http.StatusCreated, gin.H{
		"message": "User setup completed successfully",
		"user_id": req.UserID,
	})
}

// InitializeUserPreferencesHandler initializes preferences for an existing user (if missing)
func InitializeUserPreferencesHandler(c *gin.Context) {
	userIDParam := c.Param("id")

	userID, err := strconv.Atoi(userIDParam)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	// Get user info to extract sex_pref and age
	var user models.User
	if err := conf.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "user not found")
		return
	}

	// Create basic default preferences
	if err := services.CreateDefaultPreferencesForUser(userID, user.Age, user.SexPref); err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to initialize preferences: "+err.Error())
		return
	}

	utils.RespondSuccess(c, http.StatusCreated, gin.H{
		"message": "User preferences initialized successfully",
		"user_id": userID,
	})
}