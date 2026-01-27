package conf

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client
var Ctx = context.Background()

// InitRedis initializes the Redis connection
func InitRedis() error {
	host := os.Getenv("REDIS_HOST")
	if host == "" {
		host = "redis" // Default for Docker environment
	}

	port := os.Getenv("REDIS_PORT")
	if port == "" {
		port = "6379"
	}

	db := 0
	if dbStr := os.Getenv("REDIS_DB"); dbStr != "" {
		if dbInt, err := strconv.Atoi(dbStr); err == nil {
			db = dbInt
		}
	}

	password := os.Getenv("REDIS_PASSWORD")

	RedisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", host, port),
		Password: password,
		DB:       db,
	})

	// Test connection
	_, err := RedisClient.Ping(Ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return nil
}

// SetUserOnline sets a user as online with TTL
func SetUserOnline(userID uint) error {
	if RedisClient == nil {
		return fmt.Errorf("Redis client not initialized")
	}

	// Set user as online with 2-minute TTL
	onlineKey := fmt.Sprintf("user:online:%d", userID)
	err := RedisClient.Set(Ctx, onlineKey, "true", 2*time.Minute).Err()
	if err != nil {
		return fmt.Errorf("failed to set user online: %w", err)
	}

	// Add to online users set
	err = RedisClient.SAdd(Ctx, "online_users", userID).Err()
	if err != nil {
		return fmt.Errorf("failed to add to online users set: %w", err)
	}

	return nil
}

// SetUserOffline removes user from online status
func SetUserOffline(userID uint) error {
	if RedisClient == nil {
		return fmt.Errorf("Redis client not initialized")
	}

	// Remove from online status
	onlineKey := fmt.Sprintf("user:online:%d", userID)
	err := RedisClient.Del(Ctx, onlineKey).Err()
	if err != nil {
		return fmt.Errorf("failed to remove user online status: %w", err)
	}

	// Remove from online users set
	err = RedisClient.SRem(Ctx, "online_users", userID).Err()
	if err != nil {
		return fmt.Errorf("failed to remove from online users set: %w", err)
	}

	// Set last seen timestamp
	lastSeenKey := fmt.Sprintf("user:last_seen:%d", userID)
	timestamp := time.Now().Unix()
	err = RedisClient.Set(Ctx, lastSeenKey, timestamp, 30*24*time.Hour).Err() // 30 days TTL
	if err != nil {
		return fmt.Errorf("failed to set last seen: %w", err)
	}

	return nil
}

// IsUserOnline checks if a user is online
func IsUserOnline(userID uint) (bool, error) {
	if RedisClient == nil {
		return false, fmt.Errorf("Redis client not initialized")
	}

	onlineKey := fmt.Sprintf("user:online:%d", userID)
	exists, err := RedisClient.Exists(Ctx, onlineKey).Result()
	if err != nil {
		return false, fmt.Errorf("failed to check user online status: %w", err)
	}

	return exists > 0, nil
}

// GetUserLastSeen gets the last seen timestamp for a user
func GetUserLastSeen(userID uint) (*time.Time, error) {
	if RedisClient == nil {
		return nil, fmt.Errorf("Redis client not initialized")
	}

	lastSeenKey := fmt.Sprintf("user:last_seen:%d", userID)
	timestampStr, err := RedisClient.Get(Ctx, lastSeenKey).Result()
	if err == redis.Nil {
		// No last seen recorded
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get last seen: %w", err)
	}

	timestamp, err := strconv.ParseInt(timestampStr, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid timestamp format: %w", err)
	}

	lastSeen := time.Unix(timestamp, 0)
	return &lastSeen, nil
}

// GetMultipleUsersStatus gets online status for multiple users efficiently
func GetMultipleUsersStatus(userIDs []uint) (map[uint]bool, error) {
	if RedisClient == nil {
		return nil, fmt.Errorf("Redis client not initialized")
	}

	if len(userIDs) == 0 {
		return make(map[uint]bool), nil
	}

	// Build keys for pipeline
	keys := make([]string, len(userIDs))
	for i, userID := range userIDs {
		keys[i] = fmt.Sprintf("user:online:%d", userID)
	}

	// Use pipeline for efficiency
	pipe := RedisClient.Pipeline()
	cmds := make([]*redis.IntCmd, len(keys))
	for i, key := range keys {
		cmds[i] = pipe.Exists(Ctx, key)
	}

	_, err := pipe.Exec(Ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to execute pipeline: %w", err)
	}

	// Process results
	result := make(map[uint]bool)
	for i, cmd := range cmds {
		exists, err := cmd.Result()
		if err != nil {
			result[userIDs[i]] = false // Default to offline on error
		} else {
			result[userIDs[i]] = exists > 0
		}
	}

	return result, nil
}

// RefreshUserOnline extends the TTL for an online user (heartbeat)
func RefreshUserOnline(userID uint) error {
	if RedisClient == nil {
		return fmt.Errorf("Redis client not initialized")
	}

	onlineKey := fmt.Sprintf("user:online:%d", userID)

	// Check if user is currently online
	exists, err := RedisClient.Exists(Ctx, onlineKey).Result()
	if err != nil {
		return fmt.Errorf("failed to check user status: %w", err)
	}

	if exists > 0 {
		// Extend TTL
		err = RedisClient.Expire(Ctx, onlineKey, 2*time.Minute).Err()
		if err != nil {
			return fmt.Errorf("failed to refresh TTL: %w", err)
		}
	}

	return nil
}