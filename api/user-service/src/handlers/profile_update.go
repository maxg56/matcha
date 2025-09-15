package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"user-service/src/conf"
	"user-service/src/models"
	"user-service/src/utils"
)

// UpdateProfileHandler updates a user profile
func UpdateProfileHandler(c *gin.Context) {
	userIDParam := c.Param("id")

	id, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	// Get authenticated user ID from JWT middleware
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	// Users can only update their own profile
	if uint(id) != uint(authenticatedUserID.(int)) {
		utils.RespondError(c, http.StatusForbidden, "cannot update another user's profile")
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid payload: "+err.Error())
		return
	}

	var user models.User
	if err := conf.DB.First(&user, id).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "user not found")
		return
	}

	// Update fields if provided
	if req.FirstName != nil {
		user.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		user.LastName = *req.LastName
	}
	if req.Height != nil {
		user.Height.Int64 = int64(*req.Height)
		user.Height.Valid = true
	}

	utils.SetNullString(&user.HairColor, req.HairColor)
	utils.SetNullString(&user.EyeColor, req.EyeColor)
	utils.SetNullString(&user.SkinColor, req.SkinColor)
	utils.SetNullString(&user.AlcoholConsumption, req.AlcoholConsumption)
	utils.SetNullString(&user.Smoking, req.Smoking)
	utils.SetNullString(&user.Cannabis, req.Cannabis)
	utils.SetNullString(&user.Drugs, req.Drugs)
	utils.SetNullString(&user.Pets, req.Pets)
	utils.SetNullString(&user.SocialActivityLevel, req.SocialActivityLevel)
	utils.SetNullString(&user.SportActivity, req.SportActivity)
	utils.SetNullString(&user.EducationLevel, req.EducationLevel)
	utils.SetNullString(&user.PersonalOpinion, req.PersonalOpinion)
	utils.SetNullString(&user.BirthCity, req.BirthCity)
	utils.SetNullString(&user.CurrentCity, req.CurrentCity)
	utils.SetNullString(&user.Job, req.Job)
	utils.SetNullString(&user.Religion, req.Religion)
	utils.SetNullString(&user.ChildrenStatus, req.ChildrenStatus)
	utils.SetNullString(&user.ChildrenDetails, req.ChildrenDetails)
	utils.SetNullString(&user.ZodiacSign, req.ZodiacSign)
	utils.SetNullString(&user.PoliticalView, req.PoliticalView)

	if req.Bio != nil {
		user.Bio = *req.Bio
	}

	// Start transaction to update user and tags
	tx := conf.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		utils.RespondError(c, http.StatusInternalServerError, "failed to update profile")
		return
	}

	// Update tags if provided
	if req.Tags != nil {
		if err := utils.UpdateUserTags(tx, user.ID, req.Tags); err != nil {
			tx.Rollback()
			utils.RespondError(c, http.StatusInternalServerError, "failed to update tags")
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to commit changes")
		return
	}

	// Reload user with relations
	conf.DB.Preload("Tags").Preload("Images").First(&user, id)
	profile := user.ToPublicProfile()

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"profile": profile,
	})
}
