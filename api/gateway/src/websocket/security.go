package websocket

import (
	"net/http"
	"os"
	"strings"
)

// getAllowedOrigins returns the list of allowed origins for WebSocket connections
func getAllowedOrigins() []string {
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

// isOriginAllowed checks if the origin is in the allowed list
func isOriginAllowed(origin string) bool {
	if origin == "" {
		return false // Reject empty origins
	}
	
	allowedOrigins := getAllowedOrigins()
	for _, allowed := range allowedOrigins {
		if strings.TrimSpace(allowed) == origin {
			return true
		}
	}
	return false
}

// secureCheckOrigin provides secure origin validation for WebSocket upgrades
func secureCheckOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	
	// Log the origin for security monitoring
	LogConnection("system", "origin_check", "origin:", origin, "allowed:", isOriginAllowed(origin))
	
	return isOriginAllowed(origin)
}