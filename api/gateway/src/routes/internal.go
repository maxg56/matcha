package routes

import (
	"github.com/gin-gonic/gin"
	"gateway/src/handlers"
	"gateway/src/middleware"
)

// SetupInternalRoutes configure les routes internes pour la communication entre services
func SetupInternalRoutes(r *gin.Engine) {
	internalHandler := handlers.NewInternalHandler()

	// Routes internes (protégées par clé API ou IP restriction)
	internal := r.Group("/api/internal")
	internal.Use(middleware.InternalServiceMiddleware()) // Middleware pour vérifier les services internes
	{
		// WebSocket broadcast endpoint pour les services externes
		websocket := internal.Group("/websocket")
		{
			websocket.POST("/broadcast", internalHandler.BroadcastWebSocketMessage)
		}

		// Health check interne
		internal.GET("/health", internalHandler.HealthCheck)
	}
}