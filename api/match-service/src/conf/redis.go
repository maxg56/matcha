package conf

import (
	"log"
	"os"
	"strconv"
)

// RedisConfig holds Redis configuration
type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
	Enabled  bool
}

var Redis *RedisConfig

// InitRedisConfig initializes Redis configuration from environment variables
func InitRedisConfig() {
	Redis = &RedisConfig{
		Host:     getEnv("REDIS_HOST", "localhost"),
		Port:     getEnv("REDIS_PORT", "6379"),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       getEnvAsInt("REDIS_DB", 0),
		Enabled:  getEnvAsBool("USE_REDIS_CACHE", false),
	}

	log.Printf("Redis config - Host: %s, Port: %s, DB: %d, Enabled: %t", 
		Redis.Host, Redis.Port, Redis.DB, Redis.Enabled)
}

// GetRedisAddr returns the Redis address in host:port format
func (r *RedisConfig) GetRedisAddr() string {
	// Check for REDIS_ADDR first (full address)
	if addr := os.Getenv("REDIS_ADDR"); addr != "" {
		return addr
	}
	return r.Host + ":" + r.Port
}

// Helper functions for environment variables specific to Redis
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		return value == "true" || value == "1"
	}
	return defaultValue
}