package main

import (
    "fmt"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "golang.org/x/crypto/bcrypt"
    jwt "github.com/golang-jwt/jwt/v5"

    db "auth-service/src/conf"
    models "auth-service/src/models"
)

func forgotPasswordHandler(c *gin.Context) {
    type ForgotPasswordRequest struct {
        Email string `json:"email" binding:"required"`
    }
    var req ForgotPasswordRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        respondError(c, http.StatusBadRequest, "invalid payload")
        return
    }
    
    // Check if user exists
    var user models.User
    if err := db.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
        // Don't reveal if email exists or not for security
        respondSuccess(c, http.StatusOK, gin.H{
            "message": "if the email exists, a reset link has been sent",
        })
        return
    }
    
    // Generate a secure reset token
    token, err := generateResetToken(user.ID)
    if err != nil {
        respondError(c, http.StatusInternalServerError, "failed to generate reset token")
        return
    }
    
    // In a real application, you would:
    // 1. Store the token in database with expiration
    // 2. Send email with reset link
    // For now, we'll return the token for testing purposes
    
    respondSuccess(c, http.StatusOK, gin.H{
        "message": "password reset initiated",
        "reset_token": token, // Remove this in production
        "note": "In production, this token would be sent via email",
    })
}

func resetPasswordHandler(c *gin.Context) {
    type ResetPasswordRequest struct {
        Token       string `json:"token" binding:"required"`
        NewPassword string `json:"new_password" binding:"required"`
    }
    var req ResetPasswordRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        respondError(c, http.StatusBadRequest, "invalid payload")
        return
    }
    
    // Verify and parse reset token
    userID, err := verifyResetToken(req.Token)
    if err != nil {
        respondError(c, http.StatusBadRequest, "invalid or expired reset token")
        return
    }
    
    // Validate password strength (basic validation)
    if len(req.NewPassword) < 8 {
        respondError(c, http.StatusBadRequest, "password must be at least 8 characters long")
        return
    }
    
    // Hash new password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
    if err != nil {
        respondError(c, http.StatusInternalServerError, "failed to hash password")
        return
    }
    
    // Update user's password in database
    if err := db.DB.Model(&models.User{}).Where("id = ?", userID).Update("password_hash", string(hashedPassword)).Error; err != nil {
        respondError(c, http.StatusInternalServerError, "failed to update password")
        return
    }
    
    respondSuccess(c, http.StatusOK, gin.H{
        "message": "password successfully updated",
    })
}

// generateResetToken creates a JWT token for password reset
func generateResetToken(userID uint) (string, error) {
    secret, err := getJWTSecret()
    if err != nil {
        return "", err
    }
    
    claims := jwt.MapClaims{
        "user_id": userID,
        "purpose": "password_reset",
        "iat":     time.Now().Unix(),
        "exp":     time.Now().Add(time.Hour * 1).Unix(), // 1 hour expiration
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secret))
}

// verifyResetToken verifies a password reset token and returns the user ID
func verifyResetToken(tokenString string) (uint, error) {
    secret, err := getJWTSecret()
    if err != nil {
        return 0, err
    }
    
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return []byte(secret), nil
    })
    
    if err != nil {
        return 0, err
    }
    
    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        // Verify purpose
        if purpose, ok := claims["purpose"].(string); !ok || purpose != "password_reset" {
            return 0, fmt.Errorf("invalid token purpose")
        }
        
        // Extract user ID
        if userID, ok := claims["user_id"].(float64); ok {
            return uint(userID), nil
        }
        return 0, fmt.Errorf("invalid user_id in token")
    }
    
    return 0, fmt.Errorf("invalid token")
}
