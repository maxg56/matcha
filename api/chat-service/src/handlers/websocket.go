package handlers

import (
	"chat-service/src/middleware"
	wsocket "chat-service/src/websocket"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		
		// Allow same origin (no Origin header or same host)
		if origin == "" {
			return true
		}
		
		// Whitelist of allowed origins for WebSocket connections
		allowedOrigins := []string{
			"http://localhost:3000",   // React development server
			"http://localhost:8000",   // Caddy proxy
			"https://localhost:8000",  // Caddy proxy with SSL
			"http://127.0.0.1:3000",
			"http://127.0.0.1:8000",
			"https://127.0.0.1:8000",
		}
		
		// Add production domains from environment variables
		if prodDomain := os.Getenv("FRONTEND_DOMAIN"); prodDomain != "" {
			allowedOrigins = append(allowedOrigins, prodDomain)
		}
		
		// Support multiple domains via comma-separated list
		if extraDomains := os.Getenv("ALLOWED_ORIGINS"); extraDomains != "" {
			domains := strings.Split(extraDomains, ",")
			for _, domain := range domains {
				domain = strings.TrimSpace(domain)
				if domain != "" {
					allowedOrigins = append(allowedOrigins, domain)
				}
			}
		}
		
		for _, allowed := range allowedOrigins {
			if origin == allowed {
				return true
			}
		}
		
		log.Printf("WebSocket connection rejected from origin: %s", origin)
		return false
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Global hub instance - should be initialized properly in main
var globalHub *wsocket.Hub

// SetGlobalHub sets the global WebSocket hub
func SetGlobalHub(hub *wsocket.Hub) {
	globalHub = hub
}

// HandleWebSocket upgrades HTTP connection to WebSocket
func HandleWebSocket(c *gin.Context) {
	// Check if hub is initialized
	if globalHub == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "WebSocket service not initialized"})
		return
	}

	// Extract user ID from middleware
	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	// Upgrade connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	// Create new connection wrapper
	wsConn := wsocket.NewConnection(conn, userID, globalHub)

	// Register connection with hub
	globalHub.RegisterConnection(wsConn)

	// Start connection handlers
	wsConn.StartConnection(globalHub.GetChatService())
}

// HandleGatewayWebSocket handles WebSocket connections from the Gateway
func HandleGatewayWebSocket(c *gin.Context) {
	// Check if hub is initialized
	if globalHub == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "WebSocket service not initialized"})
		return
	}

	// Verify this is a Gateway client connection
	gatewayHeader := c.GetHeader("X-Gateway-Client")
	if gatewayHeader != "true" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only Gateway clients are allowed on this endpoint"})
		return
	}

	// Upgrade connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	log.Printf("✅ Gateway WebSocket connection established")

	// Handle Gateway WebSocket communication
	globalHub.HandleGatewayConnection(conn)
}