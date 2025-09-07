package utils

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

// CacheItem represents a cached item with expiration
type CacheItem struct {
	Value      interface{}
	Expiration time.Time
}

// Cache interface that can be implemented by different cache backends
type Cache interface {
	Set(key string, value interface{}, ttl time.Duration) error
	Get(key string) (interface{}, bool)
	Delete(key string) error
	Clear() error
	Size() int
}

// InMemoryCache provides in-memory caching with TTL
type InMemoryCache struct {
	items map[string]CacheItem
	mutex sync.RWMutex
}

// RedisCache provides Redis-based caching
type RedisCache struct {
	client *redis.Client
	ctx    context.Context
}

// NewRedisCache creates a new Redis cache client
func NewRedisCache() *RedisCache {
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}
	
	redisPassword := os.Getenv("REDIS_PASSWORD")
	redisDB := 0
	if dbStr := os.Getenv("REDIS_DB"); dbStr != "" {
		if db, err := strconv.Atoi(dbStr); err == nil {
			redisDB = db
		}
	}
	
	rdb := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: redisPassword,
		DB:       redisDB,
	})
	
	return &RedisCache{
		client: rdb,
		ctx:    context.Background(),
	}
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

// Redis cache implementation

// Set stores a value in Redis with TTL
func (r *RedisCache) Set(key string, value interface{}, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return r.client.Set(r.ctx, key, data, ttl).Err()
}

// Get retrieves a value from Redis
func (r *RedisCache) Get(key string) (interface{}, bool) {
	data, err := r.client.Get(r.ctx, key).Result()
	if err != nil {
		return nil, false
	}
	
	var value interface{}
	if err := json.Unmarshal([]byte(data), &value); err != nil {
		return nil, false
	}
	return value, true
}

// Delete removes a key from Redis
func (r *RedisCache) Delete(key string) error {
	return r.client.Del(r.ctx, key).Err()
}

// Clear removes all items from Redis (use with caution)
func (r *RedisCache) Clear() error {
	return r.client.FlushDB(r.ctx).Err()
}

// Size returns the number of keys in Redis database
func (r *RedisCache) Size() int {
	size, err := r.client.DBSize(r.ctx).Result()
	if err != nil {
		return 0
	}
	return int(size)
}

// In-memory cache implementation

// Set stores a value in cache with TTL
func (c *InMemoryCache) Set(key string, value interface{}, ttl time.Duration) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	c.items[key] = CacheItem{
		Value:      value,
		Expiration: time.Now().Add(ttl),
	}
	return nil
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
func (c *InMemoryCache) Delete(key string) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	delete(c.items, key)
	return nil
}

// Clear removes all items from cache
func (c *InMemoryCache) Clear() error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	c.items = make(map[string]CacheItem)
	return nil
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
	CompatibilityCache Cache
	UserVectorCache    Cache
	PreferenceCache    Cache
)

// InitializeCaches sets up all cache instances
func InitializeCaches() {
	// Check if Redis should be used
	useRedis := os.Getenv("USE_REDIS_CACHE")
	if useRedis == "true" || useRedis == "1" {
		// Use Redis for caching
		CompatibilityCache = NewRedisCache()
		UserVectorCache = NewRedisCache()
		PreferenceCache = NewRedisCache()
	} else {
		// Fall back to in-memory caching
		CompatibilityCache = NewInMemoryCache()
		UserVectorCache = NewInMemoryCache()
		PreferenceCache = NewInMemoryCache()
	}
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
	// For Redis, we use pattern matching to delete keys
	if redisCache, ok := CompatibilityCache.(*RedisCache); ok {
		// Delete compatibility scores involving this user
		pattern := fmt.Sprintf("compat:%d:*", userID)
		keys, err := redisCache.client.Keys(redisCache.ctx, pattern).Result()
		if err == nil && len(keys) > 0 {
			redisCache.client.Del(redisCache.ctx, keys...)
		}
		
		// Delete reverse compatibility scores
		pattern = fmt.Sprintf("compat:*:%d", userID)
		keys, err = redisCache.client.Keys(redisCache.ctx, pattern).Result()
		if err == nil && len(keys) > 0 {
			redisCache.client.Del(redisCache.ctx, keys...)
		}
	} else if inMemCache, ok := CompatibilityCache.(*InMemoryCache); ok {
		// Fallback for in-memory cache
		inMemCache.mutex.Lock()
		now := time.Now()
		for key := range inMemCache.items {
			inMemCache.items[key] = CacheItem{
				Value:      inMemCache.items[key].Value,
				Expiration: now,
			}
		}
		inMemCache.mutex.Unlock()
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