package conf

import (
    "context"
    "fmt"
    "os"
    "strconv"
    "time"

    "github.com/redis/go-redis/v9"
)

var Client *redis.Client
var ctx = context.Background()

// InitRedis initializes the Redis connection
func InitRedis() error {
    host := os.Getenv("REDIS_HOST")
    if host == "" {
        host = "localhost"
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
    
    Client = redis.NewClient(&redis.Options{
        Addr:     fmt.Sprintf("%s:%s", host, port),
        Password: password,
        DB:       db,
    })
    
    // Test connection
    _, err := Client.Ping(ctx).Result()
    if err != nil {
        return fmt.Errorf("failed to connect to Redis: %w", err)
    }
    
    return nil
}

// BlacklistToken adds a JWT token to the blacklist with TTL
func BlacklistToken(tokenString string, ttl time.Duration) error {
    if Client == nil {
        return fmt.Errorf("Redis client not initialized")
    }
    
    key := "blacklist:" + tokenString
    err := Client.Set(ctx, key, "blacklisted", ttl).Err()
    if err != nil {
        return fmt.Errorf("failed to blacklist token: %w", err)
    }
    
    return nil
}

// IsTokenBlacklisted checks if a token is in the blacklist
func IsTokenBlacklisted(tokenString string) (bool, error) {
    if Client == nil {
        return false, fmt.Errorf("Redis client not initialized")
    }
    
    key := "blacklist:" + tokenString
    exists, err := Client.Exists(ctx, key).Result()
    if err != nil {
        return false, fmt.Errorf("failed to check blacklist: %w", err)
    }
    
    return exists > 0, nil
}

// InvalidateUserTokens invalidates all tokens for a specific user (optional)
func InvalidateUserTokens(userID string) error {
    if Client == nil {
        return fmt.Errorf("Redis client not initialized")
    }
    
    // Store user invalidation timestamp
    key := "user_invalidated:" + userID
    err := Client.Set(ctx, key, time.Now().Unix(), 24*7*time.Hour).Err() // 7 days
    if err != nil {
        return fmt.Errorf("failed to invalidate user tokens: %w", err)
    }
    
    return nil
}

// IsUserTokensInvalidated checks if all user tokens should be considered invalid
func IsUserTokensInvalidated(userID string, tokenIssuedAt int64) (bool, error) {
    if Client == nil {
        return false, fmt.Errorf("Redis client not initialized")
    }
    
    key := "user_invalidated:" + userID
    invalidatedAtStr, err := Client.Get(ctx, key).Result()
    if err == redis.Nil {
        // No invalidation timestamp found
        return false, nil
    }
    if err != nil {
        return false, fmt.Errorf("failed to check user invalidation: %w", err)
    }
    
    invalidatedAt, err := strconv.ParseInt(invalidatedAtStr, 10, 64)
    if err != nil {
        return false, fmt.Errorf("invalid invalidation timestamp: %w", err)
    }
    
    // Token is invalid if it was issued before the invalidation timestamp
    return tokenIssuedAt < invalidatedAt, nil
}
