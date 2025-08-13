package utils

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

var redisClient *redis.Client

// InitRedis initializes Redis client for JWT blacklisting
func InitRedis() error {
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "redis:6379"
	}

	redisPassword := os.Getenv("REDIS_PASSWORD")
	redisDB := 0 // Use DB 0 for JWT blacklist

	redisClient = redis.NewClient(&redis.Options{
		Addr:         redisAddr,
		Password:     redisPassword,
		DB:           redisDB,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Printf("Failed to connect to Redis: %v", err)
		return err
	}

	log.Println("Redis connected successfully for JWT blacklisting")
	return nil
}

// IsTokenBlacklisted checks if a JWT token is blacklisted
func IsTokenBlacklisted(token string) bool {
	if redisClient == nil {
		return false // If Redis is not available, allow the token
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// Use SHA256 hash of token as key to avoid storing full tokens
	hasher := sha256.New()
	hasher.Write([]byte(token))
	tokenHash := hex.EncodeToString(hasher.Sum(nil))

	exists, err := redisClient.Exists(ctx, "blacklist:"+tokenHash).Result()
	if err != nil {
		log.Printf("Error checking token blacklist: %v", err)
		return false // If Redis error, allow the token
	}

	return exists > 0
}

// BlacklistToken adds a token to the blacklist with TTL matching token expiration
func BlacklistToken(token string, ttl time.Duration) error {
	if redisClient == nil {
		return nil // If Redis is not available, skip blacklisting
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// Use SHA256 hash of token as key
	hasher := sha256.New()
	hasher.Write([]byte(token))
	tokenHash := hex.EncodeToString(hasher.Sum(nil))

	err := redisClient.Set(ctx, "blacklist:"+tokenHash, "1", ttl).Err()
	if err != nil {
		log.Printf("Error blacklisting token: %v", err)
		return err
	}

	return nil
}
