package main

import (
	"net/http"
	"os"
	"strings"
	"time"

	db "auth-service/src/conf"
	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
)

// Token verification handler, logout, and refresh

func verifyTokenHandler(c *gin.Context) {
	auth := c.GetHeader("Authorization")
	if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
		respondError(c, http.StatusUnauthorized, "missing bearer token")
		return
	}
	token := strings.TrimPrefix(auth, "Bearer ")

	// Get JWT secret
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		respondError(c, http.StatusInternalServerError, "server misconfigured: missing JWT_SECRET")
		return
	}

	claims, err := parseToken(token, secret)
	if err != nil {
		respondError(c, http.StatusUnauthorized, "invalid token")
		return
	}

	// Validate expiration explicitly
	if exp, ok := claims["exp"].(float64); ok {
		if time.Now().Unix() > int64(exp) {
			respondError(c, http.StatusUnauthorized, "token expired")
			return
		}
	} else {
		respondError(c, http.StatusUnauthorized, "invalid token claims: missing expiration")
		return
	}

	// Extract user ID from claims
	userID, ok := claims["sub"].(string)
	if !ok || userID == "" {
		respondError(c, http.StatusUnauthorized, "invalid token claims: missing subject")
		return
	}

	respondSuccess(c, http.StatusOK, gin.H{
		"valid":   true,
		"user_id": userID,
	})
}

func refreshTokenHandler(c *gin.Context) {
	type RefreshRequest struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "invalid payload")
		return
	}

	// Validate refresh token
	refreshSecret := os.Getenv("JWT_REFRESH_SECRET")
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		respondError(c, http.StatusInternalServerError, "server misconfigured: missing JWT_SECRET")
		return
	}
	if refreshSecret == "" {
		refreshSecret = secret
	}

	claims, err := parseToken(req.RefreshToken, refreshSecret)
	if err != nil {
		respondError(c, http.StatusUnauthorized, "invalid refresh token")
		return
	}

	// Verify it's a refresh token
	scope, ok := claims["scope"].(string)
	if !ok || scope != "refresh" {
		respondError(c, http.StatusUnauthorized, "invalid token scope")
		return
	}

	// Extract user ID
	userID, ok := claims["sub"].(string)
	if !ok || userID == "" {
		respondError(c, http.StatusUnauthorized, "invalid token claims")
		return
	}

	// Issue new tokens
	accessTTL := getDurationFromEnv("JWT_ACCESS_TTL", 15*time.Minute)
	refreshTTL := getDurationFromEnv("JWT_REFRESH_TTL", 7*24*time.Hour)

	now := time.Now()
	accessToken, err := signToken(jwt.MapClaims{
		"sub":   userID,
		"iat":   now.Unix(),
		"nbf":   now.Unix(),
		"exp":   now.Add(accessTTL).Unix(),
		"scope": "access",
	}, secret)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "failed to issue token")
		return
	}

	newRefreshToken, err := signToken(jwt.MapClaims{
		"sub":   userID,
		"iat":   now.Unix(),
		"nbf":   now.Unix(),
		"exp":   now.Add(refreshTTL).Unix(),
		"scope": "refresh",
	}, refreshSecret)
	if err != nil {
		respondError(c, http.StatusInternalServerError, "failed to issue token")
		return
	}

	respondSuccess(c, http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": newRefreshToken,
		"token_type":    "Bearer",
		"expires_in":    int(accessTTL.Seconds()),
	})
}

func logoutHandler(c *gin.Context) {
	// Extract JWT token from Authorization header
	auth := c.GetHeader("Authorization")
	if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
		respondError(c, http.StatusUnauthorized, "missing bearer token")
		return
	}

	tokenString := strings.TrimPrefix(auth, "Bearer ")

	// Parse token to get expiration and user info
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		respondError(c, http.StatusInternalServerError, "server misconfigured: missing JWT_SECRET")
		return
	}

	claims, err := parseToken(tokenString, secret)
	if err != nil {
		// Token is already invalid, consider logout successful
		respondSuccess(c, http.StatusOK, gin.H{"message": "logged out"})
		return
	}

	// Get token expiration for TTL
	var ttl time.Duration
	if exp, ok := claims["exp"].(float64); ok {
		expTime := time.Unix(int64(exp), 0)
		ttl = time.Until(expTime)
		if ttl <= 0 {
			// Token already expired
			respondSuccess(c, http.StatusOK, gin.H{"message": "logged out"})
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
		respondSuccess(c, http.StatusOK, gin.H{
			"message": "logged out successfully",
			"warning": "token blacklisting failed - token may remain valid until expiration",
		})
		return
	}

	respondSuccess(c, http.StatusOK, gin.H{
		"message": "logged out successfully",
	})
}

// Helper functions for JWT operations
func parseToken(tokenString, secret string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Ensure it's using HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, jwt.ErrTokenMalformed
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, jwt.ErrTokenInvalidClaims
	}

	return claims, nil
}
