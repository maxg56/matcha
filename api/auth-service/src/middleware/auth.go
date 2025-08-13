package middleware

import (
	"net/http"
	"os"
	"strings"

	"auth-service/src/utils"
	"github.com/gin-gonic/gin"
)

const (
	UserIDContextKey = "userID"
	UserContextKey   = "user"
)

// AuthMiddleware validates JWT tokens and sets user context
func AuthMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Get token from Authorization header
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			utils.RespondError(c, http.StatusUnauthorized, "missing or invalid authorization header")
			c.Abort()
			return
		}

		token := strings.TrimPrefix(auth, "Bearer ")

		// Get JWT secret
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			utils.RespondError(c, http.StatusInternalServerError, "server misconfigured")
			c.Abort()
			return
		}

		// Parse and validate token
		claims, err := utils.ParseToken(token, secret)
		if err != nil {
			utils.RespondError(c, http.StatusUnauthorized, "invalid token")
			c.Abort()
			return
		}

		// Extract user ID from claims
		userID, ok := claims["sub"].(string)
		if !ok || userID == "" {
			utils.RespondError(c, http.StatusUnauthorized, "invalid token claims")
			c.Abort()
			return
		}

		// Set user ID in context for use by handlers
		c.Set(UserIDContextKey, userID)

		// Continue to next handler
		c.Next()
	})
}

// OptionalAuthMiddleware validates JWT tokens if present but doesn't require them
func OptionalAuthMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Get token from Authorization header
		auth := c.GetHeader("Authorization")
		if auth != "" && strings.HasPrefix(auth, "Bearer ") {
			token := strings.TrimPrefix(auth, "Bearer ")
			secret := os.Getenv("JWT_SECRET")

			if secret != "" {
				if claims, err := utils.ParseToken(token, secret); err == nil {
					if userID, ok := claims["sub"].(string); ok && userID != "" {
						c.Set(UserIDContextKey, userID)
					}
				}
			}
		}

		// Continue regardless of authentication status
		c.Next()
	})
}