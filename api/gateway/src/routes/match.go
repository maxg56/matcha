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
		match.GET("/received-likes", proxy.ProxyRequest("match", "/api/v1/matches/received-likes"))
	}

	// Matrix routes (require authentication)
	matrix := r.Group("/api/v1/matrix")
	matrix.Use(middleware.JWTMiddleware())
	{
		matrix.GET("/users", proxy.ProxyRequest("match", "/api/v1/matrix/users"))
		matrix.GET("/compatible/:user_id", proxy.ProxyRequest("match", "/api/v1/matrix/compatible/:user_id"))
		matrix.POST("/export", proxy.ProxyRequest("match", "/api/v1/matrix/export"))
	}

	// Admin routes (require authentication and admin privileges)
	admin := r.Group("/api/v1/admin")
	admin.Use(middleware.JWTMiddleware())
	admin.Use(middleware.AdminMiddleware())
	{
		// Performance monitoring
		admin.GET("/performance", proxy.ProxyRequest("match", "/api/v1/admin/performance"))
		
		// Cache management
		admin.POST("/cache/clear", proxy.ProxyRequest("match", "/api/v1/admin/cache/clear"))
		
		// Database optimization
		admin.POST("/indexes/create", proxy.ProxyRequest("match", "/api/v1/admin/indexes/create"))
	}
}
