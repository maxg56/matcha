package middleware

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"user-service/src/utils"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Debug: log all headers
		fmt.Printf("[AUTH] Incoming headers: %+v\n", c.Request.Header)
		
		// Get user ID from header (set by gateway)
		userIDStr := c.GetHeader("X-User-ID")
		fmt.Printf("[AUTH] X-User-ID header: '%s'\n", userIDStr)
		
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
		c.Set("user_id", userID)
		c.Next()
	}
}