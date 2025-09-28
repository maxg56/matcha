package routes

import (
	"gateway/src/middleware"
	"gateway/src/proxy"
	"github.com/gin-gonic/gin"
)

// SetupMatchRoutes configures matching service routes
func SetupMatchRoutes(r *gin.Engine) {
	// Health check endpoint (no auth required)
	r.GET("/api/v1/matches/health", proxy.ProxyRequest("match", "/health"))

	// Match routes (require authentication)
	match := r.Group("/api/v1/matches")
	match.Use(middleware.JWTMiddleware())
	{
		// Match discovery and algorithms
		match.GET("/", proxy.ProxyRequest("match", "/api/v1/matches"))
		match.GET("/algorithm", proxy.ProxyRequest("match", "/api/v1/matches/algorithm"))
		match.GET("/preferences", proxy.ProxyRequest("match", "/api/v1/matches/preferences"))

		// User interactions
		match.POST("/like", proxy.ProxyRequest("match", "/api/v1/matches/like"))
		match.POST("/unlike", proxy.ProxyRequest("match", "/api/v1/matches/unlike"))
		match.POST("/block", proxy.ProxyRequest("match", "/api/v1/matches/block"))

		// Premium features - likes received
		match.GET("/received-likes", proxy.ProxyRequest("match", "/api/v1/matches/received-likes"))
		match.GET("/received-likes/preview", proxy.ProxyRequest("match", "/api/v1/matches/received-likes/preview"))
		match.GET("/like-stats", proxy.ProxyRequest("match", "/api/v1/matches/like-stats"))

		match.GET("/premium/rewind/availability ", proxy.ProxyRequest("match", "/api/v1/matches/premium/rewind/availability"))
	}
}
