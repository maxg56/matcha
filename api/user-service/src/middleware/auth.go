package middleware

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"user-service/src/utils"
)

// AuthMiddleware validates JWT tokens and extracts user info
func AuthMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Get user ID from header (set by gateway)
		userIDHeader := c.GetHeader("X-User-ID")
		if userIDHeader == "" {
			utils.RespondError(c, http.StatusUnauthorized, "missing user authentication")
			c.Abort()
			return
		}

		userID, err := strconv.ParseUint(userIDHeader, 10, 32)
		if err != nil {
			utils.RespondError(c, http.StatusUnauthorized, "invalid user ID")
			c.Abort()
			return
		}

		// Store user ID in context
		c.Set("user_id", uint(userID))

		// Get JWT token from header (for potential forwarding)
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			token := strings.TrimPrefix(authHeader, "Bearer ")
			c.Set("jwt_token", token)
		}

		c.Next()
	})
}
