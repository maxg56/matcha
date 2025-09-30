package handlers

import (
	"encoding/json"
	"net/http"
	"io"

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

// HealthCheck endpoint de santé interne
func (h *InternalHandler) HealthCheck(c *gin.Context) {
	status := gin.H{
		"status": "healthy",
		"service": "gateway-internal",
	}

	// Vérifier l'état du WebSocket manager
	if websocket.GlobalManager != nil {
		status["websocket"] = "running"
	} else {
		status["websocket"] = "not_initialized"
		status["status"] = "degraded"
	}

	c.JSON(http.StatusOK, status)
}