package middleware

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/matcha/api/paiements-service/src/utils"
)

// AuthMiddleware validates JWT tokens and extracts user info (from gateway headers)
func AuthMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Debug: Log all headers
		log.Printf("Auth Middleware - Headers: %v", c.Request.Header)
		
		// Get user ID from header (set by gateway)
		userIDHeader := c.GetHeader("X-User-ID")
		log.Printf("Auth Middleware - X-User-ID header: '%s'", userIDHeader)
		
		if userIDHeader == "" {
			log.Printf("Auth Middleware - Missing X-User-ID header, returning 401")
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
		jwtToken := c.GetHeader("X-JWT-Token")
		if jwtToken != "" {
			c.Set("jwt_token", jwtToken)
		}

		c.Next()
	})
}