package middleware

import (
	"net/http"
	"strconv"

	"chat-service/src/utils"

	"github.com/gin-gonic/gin"
)

const CtxUserIDKey = "user_id"

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetHeader("X-User-ID")
		if userID == "" {
			utils.RespondError(c, http.StatusUnauthorized, "Authentication required")
			c.Abort()
			return
		}

		if _, err := strconv.Atoi(userID); err != nil {
			utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
			c.Abort()
			return
		}

		c.Set(CtxUserIDKey, userID)
		c.Next()
	}
}

func GetUserID(c *gin.Context) (uint, error) {
	userIDStr, exists := c.Get(CtxUserIDKey)
	if !exists {
		return 0, nil
	}

	userID, err := strconv.Atoi(userIDStr.(string))
	if err != nil {
		return 0, err
	}

	return uint(userID), nil
}