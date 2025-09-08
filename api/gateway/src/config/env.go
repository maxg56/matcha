package config

import (
	"log"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config holds all environment configuration
type Config struct {
	Port           string
	JWTSecret      string
	RedisAddr      string
	RedisPassword  string
	AllowedOrigins []string
	Environment    string
	
	// Timeouts
	HTTPTimeout    time.Duration
	RedisTimeout   time.Duration
	
	// Security
	RateLimitEnabled bool
	RateLimitRPS     int
	
	// Logging
	LogLevel string
}

var GlobalConfig *Config

// LoadAndValidateConfig loads and validates all environment variables
func LoadAndValidateConfig() (*Config, error) {
	config := &Config{}
	
	// Required variables
	config.JWTSecret = getRequiredEnv("JWT_SECRET")
	
	// Optional with defaults
	config.Port = getEnvWithDefault("PORT", "8080")
	config.Environment = getEnvWithDefault("ENVIRONMENT", "development")
	config.RedisAddr = getEnvWithDefault("REDIS_ADDR", "localhost:6379")
	config.RedisPassword = os.Getenv("REDIS_PASSWORD") // Optional
	config.LogLevel = getEnvWithDefault("LOG_LEVEL", "info")
	
	// Parse allowed origins
	allowedOriginsStr := getEnvWithDefault("ALLOWED_ORIGINS", 
		"http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000")
	config.AllowedOrigins = strings.Split(allowedOriginsStr, ",")
	
	// Parse timeouts
	httpTimeoutStr := getEnvWithDefault("HTTP_TIMEOUT", "30s")
	httpTimeout, err := time.ParseDuration(httpTimeoutStr)
	if err != nil {
		log.Fatalf("Invalid HTTP_TIMEOUT: %v", err)
	}
	config.HTTPTimeout = httpTimeout
	
	redisTimeoutStr := getEnvWithDefault("REDIS_TIMEOUT", "5s")
	redisTimeout, err := time.ParseDuration(redisTimeoutStr)
	if err != nil {
		log.Fatalf("Invalid REDIS_TIMEOUT: %v", err)
	}
	config.RedisTimeout = redisTimeout
	
	// Rate limiting
	config.RateLimitEnabled = getBoolEnvWithDefault("RATE_LIMIT_ENABLED", true)
	config.RateLimitRPS = getIntEnvWithDefault("RATE_LIMIT_RPS", 100)
	
	// Validate configuration
	if err := validateConfig(config); err != nil {
		log.Fatalf("Configuration validation failed: %v", err)
	}
	
	// Set global config
	GlobalConfig = config
	
	logConfiguration(config)
	return config, nil
}

// getRequiredEnv gets a required environment variable or exits
func getRequiredEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("Required environment variable %s is not set", key)
	}
	return value
}

// getEnvWithDefault gets an environment variable with a default value
func getEnvWithDefault(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// getBoolEnvWithDefault gets a boolean environment variable with default
func getBoolEnvWithDefault(key string, defaultValue bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	
	boolVal, err := strconv.ParseBool(value)
	if err != nil {
		log.Printf("Invalid boolean value for %s: %s, using default: %t", key, value, defaultValue)
		return defaultValue
	}
	return boolVal
}

// getIntEnvWithDefault gets an integer environment variable with default
func getIntEnvWithDefault(key string, defaultValue int) int {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	
	intVal, err := strconv.Atoi(value)
	if err != nil {
		log.Printf("Invalid integer value for %s: %s, using default: %d", key, value, defaultValue)
		return defaultValue
	}
	return intVal
}

// validateConfig validates the loaded configuration
func validateConfig(config *Config) error {
	// Validate JWT secret strength (production)
	if config.Environment == "production" && len(config.JWTSecret) < 32 {
		log.Fatal("JWT_SECRET must be at least 32 characters in production")
	}
	
	// Validate allowed origins
	for i, origin := range config.AllowedOrigins {
		config.AllowedOrigins[i] = strings.TrimSpace(origin)
		if config.AllowedOrigins[i] == "" {
			log.Fatal("Empty origin found in ALLOWED_ORIGINS")
		}
	}
	
	// Validate timeouts
	if config.HTTPTimeout < time.Second {
		log.Fatal("HTTP_TIMEOUT must be at least 1 second")
	}
	
	if config.RedisTimeout < time.Millisecond*100 {
		log.Fatal("REDIS_TIMEOUT must be at least 100ms")
	}
	
	// Validate rate limiting
	if config.RateLimitRPS < 1 {
		log.Fatal("RATE_LIMIT_RPS must be at least 1")
	}
	
	return nil
}

// logConfiguration logs the loaded configuration (without secrets)
func logConfiguration(config *Config) {
	log.Println("=== Gateway Configuration ===")
	log.Printf("Environment: %s", config.Environment)
	log.Printf("Port: %s", config.Port)
	log.Printf("Redis Address: %s", config.RedisAddr)
	log.Printf("Allowed Origins: %v", config.AllowedOrigins)
	log.Printf("HTTP Timeout: %v", config.HTTPTimeout)
	log.Printf("Redis Timeout: %v", config.RedisTimeout)
	log.Printf("Rate Limiting: %t (RPS: %d)", config.RateLimitEnabled, config.RateLimitRPS)
	log.Printf("Log Level: %s", config.LogLevel)
	log.Printf("JWT Secret: [REDACTED %d chars]", len(config.JWTSecret))
	log.Println("=============================")
}