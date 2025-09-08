package middleware

import (
	"net/http"
	"sync"
	"time"

	"gateway/src/config"
	"github.com/gin-gonic/gin"
)

// RateLimiter represents a rate limiter for a specific client
type RateLimiter struct {
	tokens     int
	maxTokens  int
	refillRate int
	lastRefill time.Time
	mu         sync.Mutex
}

// TokenBucket manages rate limiting per client
type TokenBucket struct {
	limiters map[string]*RateLimiter
	mu       sync.RWMutex
	
	maxTokens  int
	refillRate int // tokens per second
}

var globalRateLimiter *TokenBucket

// InitRateLimiter initializes the global rate limiter
func InitRateLimiter(maxRPS int) {
	globalRateLimiter = &TokenBucket{
		limiters:   make(map[string]*RateLimiter),
		maxTokens:  maxRPS,
		refillRate: maxRPS,
	}
	
	// Start cleanup goroutine to remove old limiters
	go globalRateLimiter.cleanup()
}

// RateLimitMiddleware provides rate limiting per IP address
func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip if rate limiting is disabled
		if config.GlobalConfig == nil || !config.GlobalConfig.RateLimitEnabled {
			c.Next()
			return
		}
		
		// Get client identifier (IP address)
		clientID := c.ClientIP()
		
		// Check rate limit
		if !globalRateLimiter.Allow(clientID) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded. Please try again later.",
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// Allow checks if a request is allowed for the given client
func (tb *TokenBucket) Allow(clientID string) bool {
	tb.mu.Lock()
	defer tb.mu.Unlock()
	
	// Get or create rate limiter for this client
	limiter, exists := tb.limiters[clientID]
	if !exists {
		limiter = &RateLimiter{
			tokens:     tb.maxTokens,
			maxTokens:  tb.maxTokens,
			refillRate: tb.refillRate,
			lastRefill: time.Now(),
		}
		tb.limiters[clientID] = limiter
	}
	
	return limiter.consume()
}

// consume tries to consume a token from the rate limiter
func (rl *RateLimiter) consume() bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	
	now := time.Now()
	elapsed := now.Sub(rl.lastRefill)
	
	// Refill tokens based on elapsed time
	if elapsed > 0 {
		tokensToAdd := int(elapsed.Seconds()) * rl.refillRate
		rl.tokens = min(rl.maxTokens, rl.tokens+tokensToAdd)
		rl.lastRefill = now
	}
	
	// Try to consume a token
	if rl.tokens > 0 {
		rl.tokens--
		return true
	}
	
	return false
}

// cleanup removes old rate limiters to prevent memory leaks
func (tb *TokenBucket) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	
	for {
		select {
		case <-ticker.C:
			tb.mu.Lock()
			now := time.Now()
			
			for clientID, limiter := range tb.limiters {
				limiter.mu.Lock()
				// Remove limiters that haven't been used for 10 minutes
				if now.Sub(limiter.lastRefill) > 10*time.Minute {
					delete(tb.limiters, clientID)
				}
				limiter.mu.Unlock()
			}
			
			tb.mu.Unlock()
		}
	}
}

// min returns the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// GetRateLimitStats returns current rate limiting statistics
func GetRateLimitStats() map[string]interface{} {
	if globalRateLimiter == nil {
		return map[string]interface{}{
			"enabled": false,
		}
	}
	
	globalRateLimiter.mu.RLock()
	defer globalRateLimiter.mu.RUnlock()
	
	return map[string]interface{}{
		"enabled":        true,
		"max_tokens":     globalRateLimiter.maxTokens,
		"refill_rate":    globalRateLimiter.refillRate,
		"active_clients": len(globalRateLimiter.limiters),
	}
}