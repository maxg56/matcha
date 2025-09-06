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

		// Performance and admin routes
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware()) // In production, add admin role check
		{
			admin.GET("/performance", handlers.GetPerformanceStatsHandler)
			admin.POST("/cache/clear", handlers.ClearCacheHandler)
			admin.POST("/indexes/create", handlers.CreateIndexesHandler)
		}
	}

	log.Println("Match service starting on port 8003")
	log.Fatal(http.ListenAndServe(":8003", r))
}