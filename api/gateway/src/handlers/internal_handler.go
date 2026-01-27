package handlers

import (
	"encoding/json"
	"net/http"
	"io"
	"time"

	"github.com/gin-gonic/gin"
	"gateway/src/websocket"
)

// InternalHandler gère les endpoints internes entre services
type InternalHandler struct{}

// NewInternalHandler crée un nouveau handler interne
func NewInternalHandler() *InternalHandler {
	return &InternalHandler{}
}

// BroadcastWebSocketMessage reçoit un message du service paiements et le diffuse via WebSocket
func (h *InternalHandler) BroadcastWebSocketMessage(c *gin.Context) {
	// Lire le corps de la requête
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to read request body",
		})
		return
	}

	// Parser le message WebSocket
	var message websocket.BroadcastMessage
	if err := json.Unmarshal(body, &message); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid message format",
		})
		return
	}

	// Valider que le manager WebSocket est disponible
	if websocket.GlobalManager == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "WebSocket manager not initialized",
		})
		return
	}

	// Envoyer le message via le channel de broadcast
	select {
	case websocket.GlobalManager.GetBroadcastChannel() <- message:
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Message broadcasted successfully",
		})
	default:
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Broadcast channel full, message not sent",
		})
	}
}

// GetUserOnlineStatus checks if a specific user is connected via WebSocket
func (h *InternalHandler) GetUserOnlineStatus(c *gin.Context) {
	userIDStr := c.Param("userID")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "user ID is required",
		})
		return
	}

	// Valider que le manager WebSocket est disponible
	if websocket.GlobalManager == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "WebSocket manager not initialized",
		})
		return
	}

	// Vérifier si l'utilisateur est en ligne
	isOnline := websocket.GlobalManager.IsUserOnline(userIDStr)

	response := gin.H{
		"success":   true,
		"user_id":   userIDStr,
		"is_online": isOnline,
	}

	// Si l'utilisateur est en ligne, ajouter des infos sur la connexion
	if isOnline {
		_, lastPing := websocket.GlobalManager.GetUserConnectionInfo(userIDStr)
		response["last_ping"] = lastPing
	}

	c.JSON(http.StatusOK, response)
}

// GetMultipleUsersOnlineStatus checks online status for multiple users
func (h *InternalHandler) GetMultipleUsersOnlineStatus(c *gin.Context) {
	var request struct {
		UserIDs []string `json:"user_ids"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request format",
		})
		return
	}

	// Valider que le manager WebSocket est disponible
	if websocket.GlobalManager == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "WebSocket manager not initialized",
		})
		return
	}

	results := make(map[string]gin.H)

	for _, userID := range request.UserIDs {
		isOnline := websocket.GlobalManager.IsUserOnline(userID)
		userStatus := gin.H{
			"is_online": isOnline,
		}

		if isOnline {
			_, lastPing := websocket.GlobalManager.GetUserConnectionInfo(userID)
			userStatus["last_ping"] = lastPing
		}

		results[userID] = userStatus
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    results,
	})
}

// GetWebSocketStats returns WebSocket connection statistics
func (h *InternalHandler) GetWebSocketStats(c *gin.Context) {
	// Valider que le manager WebSocket est disponible
	if websocket.GlobalManager == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "WebSocket manager not initialized",
		})
		return
	}

	connectedUsers := websocket.GlobalManager.GetConnectedUsers()
	connectionCount := websocket.GlobalManager.GetConnectionCount()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"connection_count": connectionCount,
			"connected_users":  connectedUsers,
			"timestamp":        time.Now(),
		},
	})
}

// HealthCheck endpoint de santé interne
func (h *InternalHandler) HealthCheck(c *gin.Context) {
	status := gin.H{
		"status": "healthy",
		"service": "gateway-internal",
	}

	// Vérifier l'état du WebSocket manager
	if websocket.GlobalManager != nil {
		status["websocket"] = "running"
		status["connected_users"] = websocket.GlobalManager.GetConnectionCount()
	} else {
		status["websocket"] = "not_initialized"
		status["status"] = "degraded"
	}

	c.JSON(http.StatusOK, status)
}