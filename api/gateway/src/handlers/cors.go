package handlers

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// getAllowedCORSOrigins returns the list of allowed CORS origins
func getAllowedCORSOrigins() []string {
	// Get allowed origins from environment variable
	allowedOriginsEnv := os.Getenv("ALLOWED_ORIGINS")
	if allowedOriginsEnv != "" {
		return strings.Split(allowedOriginsEnv, ",")
	}
	
	// Default allowed origins for development
	return []string{
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://localhost:8000", // Caddy proxy
		"http://127.0.0.1:8000",
	}
}

// isOriginAllowedCORS checks if the origin is allowed for CORS
func isOriginAllowedCORS(origin string) bool {
	if origin == "" {
		return false
	}
	
	allowedOrigins := getAllowedCORSOrigins()
	for _, allowed := range allowedOrigins {
		if strings.TrimSpace(allowed) == origin {
			return true
		}
	}
	return false
}

// CORSMiddleware handles Cross-Origin Resource Sharing with security
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Set common CORS headers
		c.Header("Vary", "Origin")
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin,Content-Type,Accept,Authorization")

		// Secure CORS: only allow specific origins
		if origin != "" && isOriginAllowedCORS(origin) {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
		} else if origin == "" {
			// No Origin header (e.g., curl, server-to-server)
			// Use wildcard but no credentials per CORS spec
			c.Header("Access-Control-Allow-Origin", "*")
			c.Header("Access-Control-Allow-Credentials", "false")
		} else {
			// Unauthorized origin - reject with CORS error
			c.Header("Access-Control-Allow-Origin", "null")
			c.Header("Access-Control-Allow-Credentials", "false")
		}

		// Handle preflight OPTIONS requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
