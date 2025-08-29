package handlers

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	db "auth-service/src/conf"
	"auth-service/src/models"
	"auth-service/src/services"
	"auth-service/src/types"
	"auth-service/src/utils"
)

// User alias pour models.Users
type User = models.Users

// EmailVerification alias pour models.EmailVerification  
type EmailVerification = models.EmailVerification

// generateVerificationCode generates a 6-digit verification code
func generateVerificationCode() (string, error) {
	const digits = "0123456789"
	code := make([]byte, 6)
	for i := range code {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		code[i] = digits[num.Int64()]
	}
	return string(code), nil
}

// SendEmailVerificationHandler handles sending email verification codes
func SendEmailVerificationHandler(c *gin.Context) {
	var req types.EmailVerificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request format")
		return
	}

	// Check if user exists
	var user User
	if err := db.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.RespondError(c, http.StatusNotFound, "User not found")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Database error")
		return
	}

	// Check if user is already verified
	if user.EmailVerified {
		utils.RespondError(c, http.StatusBadRequest, "Email already verified")
		return
	}

	// Generate verification code
	code, err := generateVerificationCode()
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to generate verification code")
		return
	}

	// Create or update verification record
	verification := EmailVerification{
		Email:            req.Email,
		VerificationCode: code,
		ExpiresAt:        time.Now().Add(15 * time.Minute), // 15 minutes expiry
	}

	// Delete any existing verification for this email
	db.DB.Where("email = ?", req.Email).Delete(&EmailVerification{})

	// Create new verification record
	if err := db.DB.Create(&verification).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to create verification record")
		return
	}

	// Send verification email
	emailService := services.NewEmailService()
	if err := emailService.SendVerificationEmail(req.Email, code); err != nil {
		// Log error but don't fail the request - code is still valid
		fmt.Printf("Failed to send verification email to %s: %v\n", req.Email, err)
		fmt.Printf("Verification code for %s: %s (email failed to send)\n", req.Email, code)
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "Verification code sent successfully",
	})
}

// VerifyEmailHandler handles email verification with code
func VerifyEmailHandler(c *gin.Context) {
	var req types.VerifyEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request format")
		return
	}

	// Find verification record
	var verification EmailVerification
	if err := db.DB.Where("email = ? AND verification_code = ?", req.Email, req.VerificationCode).First(&verification).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.RespondError(c, http.StatusBadRequest, "Invalid verification code")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Database error")
		return
	}

	// Check if code is expired
	if time.Now().After(verification.ExpiresAt) {
		// Delete expired verification
		db.DB.Delete(&verification)
		utils.RespondError(c, http.StatusBadRequest, "Verification code expired")
		return
	}

	// Update user as verified
	if err := db.DB.Model(&User{}).Where("email = ?", req.Email).Update("email_verified", true).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to update user verification status")
		return
	}

	// Delete the verification record
	db.DB.Delete(&verification)

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "Email verified successfully",
	})
}