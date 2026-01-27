package middleware

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"match-service/src/utils"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from header (set by gateway)
		userIDStr := c.GetHeader("X-User-ID")
		if userIDStr == "" {
			utils.RespondError(c, http.StatusUnauthorized, "User ID header missing")
			c.Abort()
			return
		}

		// Validate user ID
		userID, err := strconv.Atoi(userIDStr)
		if err != nil || userID <= 0 {
			utils.RespondError(c, http.StatusBadRequest, "Invalid user ID")
			c.Abort()
			return
		}

		// Store user ID in context
		c.Set("userID", userID)
		c.Next()
	}
}