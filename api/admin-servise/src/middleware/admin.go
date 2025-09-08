package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"admin-service/src/utils"
)

const (
	CtxAdminID = "admin_id"
	CtxRole    = "role"
)

func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			utils.RespondError(c, http.StatusUnauthorized, "missing bearer token")
			c.Abort()
			return
		}
		token := strings.TrimPrefix(auth, "Bearer ")

		// First try to parse as admin token
		claims, err := utils.ParseAdminToken(token)
		if err == nil {
			// It's an admin token, check scope
			if scope, _ := claims["scope"].(string); scope != "admin" {
				utils.RespondError(c, http.StatusForbidden, "invalid scope")
				c.Abort()
				return
			}
			sub, _ := claims["sub"].(string)
			role, _ := claims["role"].(string)
			c.Set(CtxAdminID, sub)
			c.Set(CtxRole, role)
			c.Next()
			return
		}

		// If admin token parsing failed, try to parse as regular user token
		// This allows regular authenticated users to access admin endpoints if they have admin privileges
		userClaims, userErr := utils.ParseUserToken(token)
		if userErr != nil {
			utils.RespondError(c, http.StatusUnauthorized, "invalid token")
			c.Abort()
			return
		}

		// Extract user ID from user token
		userID, ok := userClaims["sub"].(string)
		if !ok || userID == "" {
			utils.RespondError(c, http.StatusUnauthorized, "invalid user token")
			c.Abort()
			return
		}

		// Check if user has admin privileges in database
		if !utils.IsUserAdmin(userID) {
			utils.RespondError(c, http.StatusForbidden, "insufficient privileges")
			c.Abort()
			return
		}

		// Set context for admin access
		c.Set(CtxAdminID, userID)
		c.Set(CtxRole, "user_admin") // Regular user with admin access
		c.Next()
	}
}

func RequireSuperAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		RequireAdmin()(c)
		if c.IsAborted() {
			return
		}
		if r, ok := c.Get(CtxRole); ok && r == "super_admin" {
			return
		}
		utils.RespondError(c, http.StatusForbidden, "super admin required")
		c.Abort()
	}
}
