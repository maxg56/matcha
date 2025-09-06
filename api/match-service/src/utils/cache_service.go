package utils

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"
)

// CacheItem represents a cached item with expiration
type CacheItem struct {
	Value      interface{}
	Expiration time.Time
}

// InMemoryCache provides in-memory caching with TTL
type InMemoryCache struct {
	items map[string]CacheItem
	mutex sync.RWMutex
}

// NewInMemoryCache creates a new in-memory cache
func NewInMemoryCache() *InMemoryCache {
	cache := &InMemoryCache{
		items: make(map[string]CacheItem),
	}
	
	// Start cleanup goroutine
	go cache.cleanup()
	
	return cache
}

// Set stores a value in cache with TTL
func (c *InMemoryCache) Set(key string, value interface{}, ttl time.Duration) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	c.items[key] = CacheItem{
		Value:      value,
		Expiration: time.Now().Add(ttl),
	}
}

// Get retrieves a value from cache
func (c *InMemoryCache) Get(key string) (interface{}, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	
	item, exists := c.items[key]
	if !exists {
		return nil, false
	}
	
	if time.Now().After(item.Expiration) {
		// Item expired, remove it
		c.mutex.RUnlock()
		c.mutex.Lock()
		delete(c.items, key)
		c.mutex.Unlock()
		c.mutex.RLock()
		return nil, false
	}
	
	return item.Value, true
}

// Delete removes a key from cache
func (c *InMemoryCache) Delete(key string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	delete(c.items, key)
}

// Clear removes all items from cache
func (c *InMemoryCache) Clear() {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	c.items = make(map[string]CacheItem)
}

// Size returns the number of items in cache
func (c *InMemoryCache) Size() int {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	return len(c.items)
}

// cleanup removes expired items periodically
func (c *InMemoryCache) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	for range ticker.C {
		c.mutex.Lock()
		now := time.Now()
		for key, item := range c.items {
			if now.After(item.Expiration) {
				delete(c.items, key)
			}
		}
		c.mutex.Unlock()
	}
}

// Global cache instances
var (
	CompatibilityCache *InMemoryCache
	UserVectorCache   *InMemoryCache
	PreferenceCache   *InMemoryCache
)

// InitializeCaches sets up all cache instances
func InitializeCaches() {
	CompatibilityCache = NewInMemoryCache()
	UserVectorCache = NewInMemoryCache()
	PreferenceCache = NewInMemoryCache()
}

// Cache key generators
func CompatibilityCacheKey(userID, targetUserID int) string {
	return fmt.Sprintf("compat:%d:%d", userID, targetUserID)
}

func UserVectorCacheKey(userID int) string {
	return fmt.Sprintf("vector:%d", userID)
}

func PreferenceCacheKey(userID int) string {
	return fmt.Sprintf("pref:%d", userID)
}

func UserMatchesCacheKey(userID int) string {
	return fmt.Sprintf("matches:%d", userID)
}

func AlgorithmResultsCacheKey(userID int, algorithmType string, limit int, maxDistance *int) string {
	distanceStr := "nil"
	if maxDistance != nil {
		distanceStr = fmt.Sprintf("%d", *maxDistance)
	}
	return fmt.Sprintf("algo:%d:%s:%d:%s", userID, algorithmType, limit, distanceStr)
}

// Cache helper functions for common operations

// CacheCompatibilityScore caches a compatibility score between two users
func CacheCompatibilityScore(userID, targetUserID int, score CompatibilityScore, ttl time.Duration) {
	if CompatibilityCache != nil {
		key := CompatibilityCacheKey(userID, targetUserID)
		CompatibilityCache.Set(key, score, ttl)
	}
}

// GetCachedCompatibilityScore retrieves cached compatibility score
func GetCachedCompatibilityScore(userID, targetUserID int) (CompatibilityScore, bool) {
	if CompatibilityCache != nil {
		key := CompatibilityCacheKey(userID, targetUserID)
		if value, exists := CompatibilityCache.Get(key); exists {
			if score, ok := value.(CompatibilityScore); ok {
				return score, true
			}
		}
	}
	return CompatibilityScore{}, false
}

// CacheUserVector caches a user's vector representation
func CacheUserVector(userID int, vector UserVector, ttl time.Duration) {
	if UserVectorCache != nil {
		key := UserVectorCacheKey(userID)
		UserVectorCache.Set(key, vector, ttl)
	}
}

// GetCachedUserVector retrieves cached user vector
func GetCachedUserVector(userID int) (UserVector, bool) {
	if UserVectorCache != nil {
		key := UserVectorCacheKey(userID)
		if value, exists := UserVectorCache.Get(key); exists {
			if vector, ok := value.(UserVector); ok {
				return vector, true
			}
		}
	}
	return UserVector{}, false
}

// InvalidateUserCache removes all cached data for a user
func InvalidateUserCache(userID int) {
	if CompatibilityCache != nil {
		// Remove all compatibility scores involving this user
		// Note: This is a simplified approach; in production you might want more sophisticated invalidation
		CompatibilityCache.mutex.Lock()
		now := time.Now()
		for key := range CompatibilityCache.items {
			// Invalidate entries that contain this user ID
			// This could be optimized with better key structure
			CompatibilityCache.items[key] = CacheItem{
				Value:      CompatibilityCache.items[key].Value,
				Expiration: now, // Set to expired
			}
		}
		CompatibilityCache.mutex.Unlock()
	}

	if UserVectorCache != nil {
		UserVectorCache.Delete(UserVectorCacheKey(userID))
	}

	if PreferenceCache != nil {
		PreferenceCache.Delete(PreferenceCacheKey(userID))
	}
}

// GetCacheStats returns statistics about cache usage
func GetCacheStats() map[string]interface{} {
	stats := make(map[string]interface{})

	if CompatibilityCache != nil {
		stats["compatibility_cache_size"] = CompatibilityCache.Size()
	}

	if UserVectorCache != nil {
		stats["user_vector_cache_size"] = UserVectorCache.Size()
	}

	if PreferenceCache != nil {
		stats["preference_cache_size"] = PreferenceCache.Size()
	}

	return stats
}

// SerializableUserVector for JSON marshaling
type SerializableUserVector struct {
	UserVector
}

// MarshalJSON implements json.Marshaler
func (s SerializableUserVector) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.UserVector)
}

// UnmarshalJSON implements json.Unmarshaler
func (s *SerializableUserVector) UnmarshalJSON(data []byte) error {
	return json.Unmarshal(data, &s.UserVector)
}