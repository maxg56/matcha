package routes

import (
	"gateway/src/middleware"
	"gateway/src/proxy"
	"github.com/gin-gonic/gin"
)

// SetupMatchRoutes configures matching service routes
func SetupMatchRoutes(r *gin.Engine) {
	match := r.Group("/api/matches")
	match.Use(middleware.JWTMiddleware()) // All match routes require authentication

	// Match discovery
	match.GET("/list", proxy.ProxyRequest("match", "/api/v1/matches"))
	match.GET("/suggestions", proxy.ProxyRequest("match", "/api/v1/matches/suggestions"))

	// User interactions
	match.POST("/like/:userId", proxy.ProxyRequest("match", "/api/v1/matches/like/:userId"))
	match.POST("/pass/:userId", proxy.ProxyRequest("match", "/api/v1/matches/pass/:userId"))

	// Match management
	match.DELETE("/:matchId", proxy.ProxyRequest("match", "/api/v1/matches/:matchId"))

	// Health check endpoint
	match.GET("/", proxy.ProxyRequest("match", "/health"))
}
