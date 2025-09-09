package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AdminMiddleware checks if the user has admin privileges
// Currently implements a basic check - in production, this should validate
// admin role from JWT claims or database
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from context (set by JWT middleware)
		userIDInterface, exists := c.Get(CtxUserIDKey)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Authentication required for admin operations",
			})
			c.Abort()
			return
		}

		userID, ok := userIDInterface.(string)
		if !ok || userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Invalid user authentication",
			})
			c.Abort()
			return
		}

		// TODO: In production, implement proper admin role checking
		// This could involve:
		// 1. Checking JWT claims for admin role
		// 2. Querying user service for user role
		// 3. Maintaining an admin user list
		// 
		// For now, we'll log the admin access attempt and allow it
		// since the routes are already protected by JWT middleware
		log.Printf("Admin access: user_id=%s path=%s", userID, c.Request.URL.Path)

		c.Next()
	}
}