package handlers

import (
	"chat-service/src/middleware"
	wsocket "chat-service/src/websocket"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// In production, implement proper origin checking
		return true
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