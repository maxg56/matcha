package utils

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// ExtractToken extracts JWT token from Authorization header, query parameter, or cookie
func ExtractToken(c *gin.Context) string {
	// Prefer Authorization header
	auth := c.GetHeader("Authorization")
	if strings.HasPrefix(strings.ToLower(auth), "bearer ") {
		return strings.TrimSpace(auth[7:])
	}

	// Check query parameter (for WebSocket connections)
	if token := c.Query("token"); token != "" {
		return token
	}

	// Fallback to cookie commonly named access_token
	if cookie, err := c.Cookie("access_token"); err == nil && cookie != "" {
		return cookie
	}

	return ""
}

// GetNumericClaim safely extracts numeric claims from JWT
func GetNumericClaim(v any) (int64, bool) {
	switch t := v.(type) {
	case float64:
		return int64(t), true
	case float32:
		return int64(t), true
	case int64:
		return t, true
	case int:
		return int64(t), true
	case jsonNumber:
		if i, err := t.Int64(); err == nil {
			return i, true
		}
		return 0, false
	default:
		return 0, false
	}
}

// jsonNumber abstracts json.Number without importing encoding/json directly here
type jsonNumber interface {
	Int64() (int64, error)
}
