package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"

	"admin-service/src/conf"
	"admin-service/src/models"
	"admin-service/src/utils"
)

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func AdminLogin(c *gin.Context) {
	var in LoginInput
	if err := c.ShouldBindJSON(&in); err != nil {
		utils.RespondError(c, http.StatusBadRequest, err.Error())
		return
	}

	var admin models.Admin
	if err := conf.DB.Where("email = ? AND active = true", in.Email).First(&admin).Error; err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if !utils.CheckPassword(admin.Password, in.Password) {
		utils.RespondError(c, http.StatusUnauthorized, "invalid credentials")
		return
	}

	now := time.Now()
	ttl := utils.AdminAccessTTL()
	claims := jwt.MapClaims{
		"sub":   admin.ID,
		"role":  admin.Role,
		"scope": "admin",
		"iat":   now.Unix(),
		"nbf":   now.Unix(),
		"exp":   now.Add(ttl).Unix(),
	}
	token, err := utils.SignAdminToken(claims)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "token error")
		return
	}
	utils.RespondOK(c, gin.H{"access_token": token, "expires_in": int64(ttl.Seconds())})
}

type CreateAdminInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"omitempty,oneof=admin moderator"`
}

// Only super_admin can create admins
func CreateAdmin(c *gin.Context) {
	var in CreateAdminInput
	if err := c.ShouldBindJSON(&in); err != nil {
		utils.RespondError(c, http.StatusBadRequest, err.Error())
		return
	}
	if in.Role == "" {
		in.Role = string(models.RoleAdmin)
	}
	hash, err := utils.HashPassword(in.Password)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "hash error")
		return
	}

	admin := models.Admin{Email: in.Email, Password: hash, Role: in.Role}
	if err := conf.DB.Create(&admin).Error; err != nil {
		utils.RespondError(c, http.StatusConflict, err.Error())
		return
	}
	utils.RespondOK(c, gin.H{"id": admin.ID, "email": admin.Email, "role": admin.Role})
}

func ListAdmins(c *gin.Context) {
	var admins []models.Admin
	if err := conf.DB.Where("active = true").Find(&admins).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "db error")
		return
	}
	var result []gin.H
	for _, a := range admins {
		result = append(result, gin.H{
			"id":    a.ID,
			"email": a.Email,
			"role":  a.Role,
		})
	}
	utils.RespondOK(c, result)
}

type UpdateAdminInput struct {
	Email string `json:"email" binding:"omitempty,email"`
	Role  string `json:"role" binding:"omitempty,oneof=super_admin admin moderator"`
}

func UpdateAdmin(c *gin.Context) {
	id := c.Param("id")
	var in UpdateAdminInput
	if err := c.ShouldBindJSON(&in); err != nil {
		utils.RespondError(c, http.StatusBadRequest, err.Error())
		return
	}

	var admin models.Admin
	if err := conf.DB.First(&admin, id).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "admin not found")
		return
	}

	if in.Email != "" {
		admin.Email = in.Email
	}
	if in.Role != "" {
		admin.Role = in.Role
	}
	admin.UpdatedAt = time.Now()

	if err := conf.DB.Save(&admin).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "update error")
		return
	}
	utils.RespondOK(c, gin.H{"id": admin.ID, "email": admin.Email, "role": admin.Role})
}

func DeleteAdmin(c *gin.Context) {
	id := c.Param("id")
	if err := conf.DB.Model(&models.Admin{}).Where("id = ?", id).Update("active", false).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "delete error")
		return
	}
	utils.RespondOK(c, gin.H{"message": "admin deactivated"})
}
