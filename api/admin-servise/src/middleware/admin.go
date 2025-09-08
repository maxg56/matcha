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
		claims, err := utils.ParseAdminToken(token)
		if err != nil {
			utils.RespondError(c, http.StatusUnauthorized, "invalid token")
			c.Abort()
			return
		}
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
