package middleware

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"gateway/src/utils"
	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
)

const (
	CtxUserIDKey = "userID"
)

// JWTMiddleware validates JWT tokens and sets user context
func JWTMiddleware() gin.HandlerFunc {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Println("[gateway] WARNING: JWT_SECRET is not set; protected routes will reject requests")
	}

	return func(c *gin.Context) {
		if c.Request.Method == http.MethodOptions {
			c.Next()
			return
		}

		tokenString := utils.ExtractToken(c)
		if tokenString == "" || secret == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}

		// Check if token is blacklisted before parsing
		if utils.IsTokenBlacklisted(tokenString) {
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
			fmt.Printf("[JWT] Setting user ID in context: '%s'\n", sub)
			c.Set(CtxUserIDKey, sub)
		} else {
			fmt.Printf("[JWT] No valid 'sub' claim found in token: %v\n", claims)
		}

		c.Next()
	}
}

// parseJWT parses and validates a JWT token
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

	if exp, ok := utils.GetNumericClaim(claims["exp"]); ok {
		if now > exp+leeway {
			return nil, errors.New("token expired")
		}
	}

	if nbf, ok := utils.GetNumericClaim(claims["nbf"]); ok {
		if now+leeway < nbf {
			return nil, errors.New("token not yet valid")
		}
	}

	if iat, ok := utils.GetNumericClaim(claims["iat"]); ok {
		if iat > now+leeway {
			return nil, errors.New("invalid iat")
		}
	}

	return claims, nil
}
