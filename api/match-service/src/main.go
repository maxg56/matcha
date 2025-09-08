package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"match-service/src/conf"
	"match-service/src/handlers"
	"match-service/src/middleware"
)

func main() {
	// Initialize database
	conf.InitDB()

	r := gin.Default()

	// Add performance monitoring middleware
	r.Use(middleware.PerformanceMiddleware())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "match-service",
		})
	})

	// TEST ENDPOINTS: Admin stats without auth for debugging
	r.GET("/test/admin/stats", func(c *gin.Context) {
		// Set mock user for testing
		c.Set("userID", 1)
		handlers.GetAdminStatsHandler(c)
	})
	
	r.GET("/test/admin/trends", func(c *gin.Context) {
		// Set mock user for testing
		c.Set("userID", 1)
		handlers.GetMatchTrendsHandler(c)
	})

	// API routes
	api := r.Group("/api/v1")
	{
		// Match routes
		matches := api.Group("/matches")
		matches.Use(middleware.AuthMiddleware())
		{
			matches.GET("", handlers.GetMatchesHandler)
			matches.POST("/like", handlers.LikeUserHandler)
			matches.POST("/unlike", handlers.UnlikeUserHandler)
			matches.POST("/block", handlers.BlockUserHandler)
			matches.GET("/algorithm", handlers.MatchingAlgorithmHandler)
			matches.GET("/preferences", handlers.GetUserPreferencesHandler)
		}

		// Matrix routes
		matrix := api.Group("/matrix")
		matrix.Use(middleware.AuthMiddleware())
		{
			matrix.GET("/users", handlers.GetMatrixHandler)
			matrix.GET("/compatible/:user_id", handlers.GetCompatibleMatrixHandler)
			matrix.POST("/export", handlers.GenerateMatrixHandler)
		}

		// Admin routes moved to dedicated admin-service
		// All admin functionality is now handled by admin-service on port 8007
	}

	log.Println("Match service starting on port 8003")
	log.Fatal(http.ListenAndServe(":8003", r))
}