package handlers

import (
	"chat-service/src/services"

	"github.com/gin-gonic/gin"
)

var wsService *services.WebSocketService

func init() {
	wsService = services.NewWebSocketService()
}

func HandleWebSocket(c *gin.Context) {
	wsService.HandleConnection(c)
}