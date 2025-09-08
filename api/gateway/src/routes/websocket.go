package routes

import (
	"gateway/src/middleware"
	"gateway/src/websocket"
	"github.com/gin-gonic/gin"
)

// SetupWebSocketRoutes configures unified WebSocket routes
func SetupWebSocketRoutes(r *gin.Engine) {
	// Connexion WebSocket unifiée avec authentification
	r.GET("/ws", middleware.JWTMiddleware(), websocket.UnifiedWebSocketHandler())
}