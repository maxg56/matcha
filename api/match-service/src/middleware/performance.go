package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// PerformanceMiddleware measures request processing time
func PerformanceMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		
		// Process request
		c.Next()
		
		// Calculate processing time
		duration := time.Since(start)
		
		// Log slow requests (>1 second)
		if duration > time.Second {
			log.Printf("SLOW REQUEST: %s %s took %v (user: %v)", 
				c.Request.Method, 
				c.Request.URL.Path, 
				duration,
				c.GetInt("userID"))
		}
		
		// Add performance header
		c.Header("X-Response-Time", duration.String())
	}
}

// DatabaseQueryLogger logs slow database queries
func LogSlowQuery(query string, duration time.Duration, args ...interface{}) {
	if duration > 100*time.Millisecond {
		log.Printf("SLOW QUERY: %v - Query: %s - Args: %v", duration, query, args)
	}
}