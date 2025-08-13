package main

import (
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
)

const (
	ctxUserIDKey = "userID"
)

func extractToken(c *gin.Context) string {
	// Prefer Authorization header
	auth := c.GetHeader("Authorization")
	if strings.HasPrefix(strings.ToLower(auth), "bearer ") {
		return strings.TrimSpace(auth[7:])
	}
	// Fallback to cookie commonly named access_token
	if cookie, err := c.Cookie("access_token"); err == nil && cookie != "" {
		return cookie
	}
	return ""
}

func parseJWT(tokenString, secret string) (jwt.MapClaims, error) {
	if tokenString == "" {
		return nil, errors.New("empty token")
	}
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		// Ensure HMAC
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		if err == nil {
			err = errors.New("invalid token")
		}
		return nil, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}
	// Basic time validation for exp/nbf/iat with small leeway
	now := time.Now().Unix()
	leeway := int64(60)
	if exp, ok := getNumericClaim(claims["exp"]); ok {
		if now > exp+leeway {
			return nil, errors.New("token expired")
		}
	}
	if nbf, ok := getNumericClaim(claims["nbf"]); ok {
		if now+leeway < nbf {
			return nil, errors.New("token not yet valid")
		}
	}
	if iat, ok := getNumericClaim(claims["iat"]); ok {
		if iat > now+leeway {
			return nil, errors.New("invalid iat")
		}
	}
	return claims, nil
}

func getNumericClaim(v any) (int64, bool) {
	switch t := v.(type) {
	case float64:
		return int64(t), true
	case float32:
		return int64(t), true
	case int64:
		return t, true
	case int:
		return int64(t), true
	case jsonNumber:
		if i, err := t.Int64(); err == nil {
			return i, true
		}
		return 0, false
	default:
		return 0, false
	}
}

// jsonNumber abstracts json.Number without importing encoding/json directly here
type jsonNumber interface {
	Int64() (int64, error)
}

func jwtMiddleware() gin.HandlerFunc {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Println("[gateway] WARNING: JWT_SECRET is not set; protected routes will reject requests")
	}
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodOptions {
			c.Next()
			return
		}
		tokenString := extractToken(c)
		if tokenString == "" || secret == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}
		// Check if token is blacklisted before parsing
		if isTokenBlacklisted(tokenString) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token revoked"})
			return
		}

		claims, err := parseJWT(tokenString, secret)
		if err != nil {
			errorMsg := "invalid token"
			if strings.Contains(err.Error(), "expired") {
				errorMsg = "token expired"
			} else if strings.Contains(err.Error(), "not yet valid") {
				errorMsg = "token not yet valid"
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": errorMsg})
			return
		}
		// Extract common identifiers
		if sub, ok := claims["sub"].(string); ok && sub != "" {
			c.Set(ctxUserIDKey, sub)
		}
		c.Next()
	}
}
