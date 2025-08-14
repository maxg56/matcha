package handlers

import (
	"net/http"

	"auth-service/src/utils"
	"github.com/gin-gonic/gin"
)

// ForgotPasswordRequest represents password reset request payload
type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ResetPasswordRequest represents password reset confirmation payload
type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

// ForgotPasswordHandler handles password reset requests
func ForgotPasswordHandler(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid payload: "+err.Error())
		return
	}

	// TODO: Implement password reset email sending
	// For now, return success to indicate the endpoint exists
	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "Password reset email sent (if email exists)",
		"note":    "Implementation pending - email service integration required",
	})
}

// ResetPasswordHandler handles password reset confirmation
func ResetPasswordHandler(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid payload: "+err.Error())
		return
	}

	// TODO: Implement password reset confirmation
	// This would involve:
	// 1. Validate the reset token
	// 2. Find the associated user
	// 3. Update their password hash
	// 4. Invalidate the reset token
	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "Password reset successful",
		"note":    "Implementation pending - token validation and password update required",
	})
}

// HealthCheckHandler returns service health status
func HealthCheckHandler(c *gin.Context) {
	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "auth-service",
		"version": "1.0.0",
	})
}
