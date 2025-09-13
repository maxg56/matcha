package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"match-service/src/conf"
	"match-service/src/handlers"
	"match-service/src/middleware"
	"match-service/src/utils"
)

func main() {
	// Initialize Redis configuration
	conf.InitRedisConfig()
	
	// Initialize database
	conf.InitDB()

	// Initialize cache system with centralized Redis config
	utils.InitializeCachesWithConfig(
		conf.Redis.Enabled,
		conf.Redis.GetRedisAddr(),
		conf.Redis.Password,
		conf.Redis.DB,
	)
	log.Println("Cache system initialized with centralized config")

	r := gin.Default()

	// Add performance monitoring middleware
	r.Use(middleware.PerformanceMiddleware())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		cacheStats := utils.GetCacheStats()
		c.JSON(http.StatusOK, gin.H{
			"status":      "ok",
			"service":     "match-service",
			"cache_stats": cacheStats,
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

			// Premium features - likes received
			matches.GET("/received-likes", handlers.GetReceivedLikesHandler)
			matches.GET("/received-likes/preview", handlers.GetReceivedLikesPreviewHandler)
			matches.GET("/like-stats", handlers.GetLikeStatsHandler)
		}


	}

	log.Println("Match service starting on port 8003")
	log.Fatal(http.ListenAndServe(":8003", r))
}