package utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetUserIDFromContext extracts user ID from the request context
// This assumes the gateway forwards the user ID in the X-User-ID header
func GetUserIDFromContext(c *gin.Context) (uint, error) {
	userIDStr := c.GetHeader("X-User-ID")
	if userIDStr == "" {
		return 0, nil
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		return 0, err
	}

	return uint(userID), nil
}

// RequireAuth middleware to ensure user is authenticated
func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := GetUserIDFromContext(c)
		if err != nil || userID == 0 {
			RespondError(c, "Authentication required", 401)
			c.Abort()
			return
		}

		// Store user ID in context for handlers
		c.Set("user_id", userID)
		c.Next()
	}
}