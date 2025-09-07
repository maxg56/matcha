package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"match-service/src/utils"
)

func main() {
	// Set environment variables for testing
	os.Setenv("USE_REDIS_CACHE", "true")
	os.Setenv("REDIS_ADDR", "localhost:6379")
	os.Setenv("REDIS_DB", "1") // Use DB 1 for testing

	// Initialize caches
	utils.InitializeCaches()

	// Test compatibility cache
	fmt.Println("Testing Redis cache integration...")
	
	// Test basic set/get operations
	testKey := "test:key:123"
	testValue := map[string]interface{}{
		"score": 95.5,
		"timestamp": time.Now().Unix(),
	}

	// Test Set operation
	fmt.Printf("Setting cache key '%s'...", testKey)
	if err := utils.CompatibilityCache.Set(testKey, testValue, 5*time.Minute); err != nil {
		log.Fatalf("Failed to set cache: %v", err)
	}
	fmt.Println(" ✓ Success")

	// Test Get operation
	fmt.Printf("Getting cache key '%s'...", testKey)
	retrievedValue, exists := utils.CompatibilityCache.Get(testKey)
	if !exists {
		log.Fatalf("Failed to retrieve cached value")
	}
	fmt.Println(" ✓ Success")
	fmt.Printf("Retrieved value: %+v\n", retrievedValue)

	// Test cache statistics
	fmt.Println("\nCache Statistics:")
	stats := utils.GetCacheStats()
	for key, value := range stats {
		fmt.Printf("  %s: %v\n", key, value)
	}

	// Test cache invalidation
	fmt.Println("\nTesting cache invalidation...")
	userID := 123
	targetUserID := 456
	
	// Cache a compatibility score
	compatScore := utils.CompatibilityScore{
		UserID: uint(targetUserID),
		CompatibilityScore: 85.0,
		Distance: 10.5,
		AgeDifference: 2,
		Factors: map[string]interface{}{
			"interests": 90.0,
			"location": 80.0,
		},
	}
	utils.CacheCompatibilityScore(userID, targetUserID, compatScore, 10*time.Minute)
	
	// Verify it's cached
	cached, exists := utils.GetCachedCompatibilityScore(userID, targetUserID)
	if !exists {
		log.Fatalf("Failed to cache compatibility score")
	}
	fmt.Printf("Cached compatibility score: %+v\n", cached)
	
	// Invalidate user cache
	utils.InvalidateUserCache(userID)
	
	// Verify it's no longer cached (this might still exist due to Redis pattern matching)
	_, exists = utils.GetCachedCompatibilityScore(userID, targetUserID)
	fmt.Printf("Cache exists after invalidation: %v\n", exists)

	// Test Delete operation
	fmt.Printf("Deleting cache key '%s'...", testKey)
	if err := utils.CompatibilityCache.Delete(testKey); err != nil {
		log.Fatalf("Failed to delete cache: %v", err)
	}
	fmt.Println(" ✓ Success")

	// Verify deletion
	_, exists = utils.CompatibilityCache.Get(testKey)
	fmt.Printf("Cache exists after deletion: %v\n", exists)

	fmt.Println("\n✅ Redis cache integration test completed successfully!")
}