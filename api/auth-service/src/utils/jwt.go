package utils

import (
	"fmt"
	"os"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
)

// TokenPair holds access and refresh tokens
type TokenPair struct {
	AccessToken  string
	RefreshToken string
	ExpiresIn    int64
}

// SignToken creates a JWT token with the given claims
func SignToken(claims jwt.MapClaims, secret string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ParseToken parses and validates a JWT token
func ParseToken(tokenString, secret string) (jwt.MapClaims, error) {
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

// GetDurationFromEnv parses duration from environment variable with fallback
func GetDurationFromEnv(key string, fallback time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return fallback
}

// getJWTSecret retrieves JWT secret from environment with validation
func getJWTSecret() (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", fmt.Errorf("JWT_SECRET not configured")
	}
	return secret, nil
}

// GenerateTokenPair generates access and refresh token pair for a user
func GenerateTokenPair(userID uint) (*TokenPair, error) {
	// Get JWT secret from environment
	secret, err := getJWTSecret()
	if err != nil {
		return nil, err
	}

	// Get refresh secret (fallback to main secret if not set)
	refreshSecret := os.Getenv("JWT_REFRESH_SECRET")
	if refreshSecret == "" {
		refreshSecret = secret
	}

	now := time.Now()
	userIDStr := fmt.Sprintf("%d", userID)

	// Get TTL from environment
	accessTTL := GetDurationFromEnv("JWT_ACCESS_TTL", 15*time.Minute)
	refreshTTL := GetDurationFromEnv("JWT_REFRESH_TTL", 7*24*time.Hour)

	// Generate access token (short-lived)
	accessClaims := jwt.MapClaims{
		"sub":   userIDStr,
		"iat":   now.Unix(),
		"nbf":   now.Unix(),
		"exp":   now.Add(accessTTL).Unix(),
		"scope": "access",
	}
	accessToken, err := SignToken(accessClaims, secret)
	if err != nil {
		return nil, fmt.Errorf("failed to sign access token: %w", err)
	}

	// Generate refresh token (long-lived)
	refreshClaims := jwt.MapClaims{
		"sub":   userIDStr,
		"iat":   now.Unix(),
		"nbf":   now.Unix(),
		"exp":   now.Add(refreshTTL).Unix(),
		"scope": "refresh",
	}
	refreshToken, err := SignToken(refreshClaims, refreshSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(accessTTL.Seconds()),
	}, nil
}
