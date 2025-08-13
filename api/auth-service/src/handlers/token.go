package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	db "auth-service/src/conf"
	"auth-service/src/utils"
	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
)

// RefreshRequest represents token refresh payload
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// VerifyTokenHandler validates JWT tokens
func VerifyTokenHandler(c *gin.Context) {
	auth := c.GetHeader("Authorization")
	if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
		utils.RespondError(c, http.StatusUnauthorized, "missing bearer token")
		return
	}
	token := strings.TrimPrefix(auth, "Bearer ")

	// Get JWT secret
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		utils.RespondError(c, http.StatusInternalServerError, "server misconfigured: missing JWT_SECRET")
		return
	}

	claims, err := utils.ParseToken(token, secret)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "invalid token")
		return
	}

	// Validate expiration explicitly
	if exp, ok := claims["exp"].(float64); ok {
		if time.Now().Unix() > int64(exp) {
			utils.RespondError(c, http.StatusUnauthorized, "token expired")
			return
		}
	} else {
		utils.RespondError(c, http.StatusUnauthorized, "invalid token claims: missing expiration")
		return
	}

	// Extract user ID from claims
	userID, ok := claims["sub"].(string)
	if !ok || userID == "" {
		utils.RespondError(c, http.StatusUnauthorized, "invalid token claims: missing subject")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"valid":   true,
		"user_id": userID,
	})
}

// RefreshTokenHandler issues new access tokens using refresh tokens
func RefreshTokenHandler(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid payload")
		return
	}

	// Validate refresh token
	refreshSecret := os.Getenv("JWT_REFRESH_SECRET")
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		utils.RespondError(c, http.StatusInternalServerError, "server misconfigured: missing JWT_SECRET")
		return
	}
	if refreshSecret == "" {
		refreshSecret = secret
	}

	claims, err := utils.ParseToken(req.RefreshToken, refreshSecret)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "invalid refresh token")
		return
	}

	// Verify it's a refresh token
	scope, ok := claims["scope"].(string)
	if !ok || scope != "refresh" {
		utils.RespondError(c, http.StatusUnauthorized, "invalid token scope")
		return
	}

	// Extract user ID
	userID, ok := claims["sub"].(string)
	if !ok || userID == "" {
		utils.RespondError(c, http.StatusUnauthorized, "invalid token claims")
		return
	}

	// Convert string userID back to uint for token generation
	var userIDUint uint
	if _, err := fmt.Sscanf(userID, "%d", &userIDUint); err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "invalid user ID format")
		return
	}

	// Issue new tokens
	accessTTL := utils.GetDurationFromEnv("JWT_ACCESS_TTL", 15*time.Minute)
	refreshTTL := utils.GetDurationFromEnv("JWT_REFRESH_TTL", 7*24*time.Hour)

	now := time.Now()
	accessToken, err := utils.SignToken(jwt.MapClaims{
		"sub":   userID,
		"iat":   now.Unix(),
		"nbf":   now.Unix(),
		"exp":   now.Add(accessTTL).Unix(),
		"scope": "access",
	}, secret)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to issue token")
		return
	}

	newRefreshToken, err := utils.SignToken(jwt.MapClaims{
		"sub":   userID,
		"iat":   now.Unix(),
		"nbf":   now.Unix(),
		"exp":   now.Add(refreshTTL).Unix(),
		"scope": "refresh",
	}, refreshSecret)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to issue token")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": newRefreshToken,
		"token_type":    "Bearer",
		"expires_in":    int(accessTTL.Seconds()),
	})
}

// LogoutHandler handles user logout and token blacklisting
func LogoutHandler(c *gin.Context) {
	// Extract JWT token from Authorization header
	auth := c.GetHeader("Authorization")
	if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
		utils.RespondError(c, http.StatusUnauthorized, "missing bearer token")
		return
	}

	tokenString := strings.TrimPrefix(auth, "Bearer ")

	// Parse token to get expiration and user info
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		utils.RespondError(c, http.StatusInternalServerError, "server misconfigured: missing JWT_SECRET")
		return
	}

	claims, err := utils.ParseToken(tokenString, secret)
	if err != nil {
		// Token is already invalid, consider logout successful
		utils.RespondSuccess(c, http.StatusOK, gin.H{"message": "logged out"})
		return
	}

	// Get token expiration for TTL
	var ttl time.Duration
	if exp, ok := claims["exp"].(float64); ok {
		expTime := time.Unix(int64(exp), 0)
		ttl = time.Until(expTime)
		if ttl <= 0 {
			// Token already expired
			utils.RespondSuccess(c, http.StatusOK, gin.H{"message": "logged out"})
			return
		}
	} else {
		// Default TTL if no expiration found
		ttl = 24 * time.Hour
	}

	// Blacklist the token
	err = db.BlacklistToken(tokenString, ttl)
	if err != nil {
		// Log error but still consider logout successful
		utils.RespondSuccess(c, http.StatusOK, gin.H{
			"message": "logged out successfully",
			"warning": "token blacklisting failed - token may remain valid until expiration",
		})
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"message": "logged out successfully",
	})
}