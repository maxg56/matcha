package conf

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type EnvConfig struct {
	// Server Configuration
	Port    string
	GinMode string

	// Database Configuration
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	// Stripe Configuration
	StripeSecretKey     string
	StripePriceMensuel  string
	StripePriceAnnuel   string
	StripeWebhookSecret string

	// Other Configuration
	AutoMigrate      string
	CorsAllowedOrigins string
	AllowedOrigins     string
}

var Env *EnvConfig

func InitEnv() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	Env = &EnvConfig{
		// Server Configuration
		Port:    getEnvWithDefault("PAYOUT_SERVICE_PORT", "8085"),
		GinMode: getEnvWithDefault("GIN_MODE", "debug"),

		// Database Configuration
		DBHost:     getEnvWithDefault("DB_HOST", "localhost"),
		DBPort:     getEnvWithDefault("DB_PORT", "5432"),
		DBUser:     getEnvWithDefault("DB_USER", "postgres"),
		DBPassword: getEnvWithDefault("DB_PASSWORD", ""),
		DBName:     getEnvWithDefault("DB_NAME", "matcha_dev"),

		// Stripe Configuration
		StripeSecretKey:     os.Getenv("STRIPE_SECRET_KEY"),
		StripePriceMensuel:  os.Getenv("STRIPE_PRICE_MENSUEL"),
		StripePriceAnnuel:   os.Getenv("STRIPE_PRICE_ANNUEL"),
		StripeWebhookSecret: os.Getenv("STRIPE_WEBHOOK_SECRET"),

		// Other Configuration
		AutoMigrate:        getEnvWithDefault("AUTO_MIGRATE", "false"),
		CorsAllowedOrigins: getEnvWithDefault("CORS_ALLOWED_ORIGINS", "http://localhost:3000"),
		AllowedOrigins:     getEnvWithDefault("ALLOWED_ORIGINS", "http://localhost:8000"),
	}

	// Validate configuration
	validateEnv()

	log.Printf("Payment service configuration loaded successfully (mode: %s, port: %s)", Env.GinMode, Env.Port)
}

func validateEnv() {
	// Only validate Stripe configuration in production
	if Env.GinMode == "release" {
		requiredStripeVars := map[string]string{
			"STRIPE_SECRET_KEY":     Env.StripeSecretKey,
			"STRIPE_PRICE_MENSUEL":  Env.StripePriceMensuel,
			"STRIPE_PRICE_ANNUEL":   Env.StripePriceAnnuel,
			"STRIPE_WEBHOOK_SECRET": Env.StripeWebhookSecret,
		}

		for varName, value := range requiredStripeVars {
			if value == "" {
				log.Fatalf("❌ Required environment variable %s is not set in production mode", varName)
			}
		}
		log.Println("✅ All required production environment variables are configured")
	} else {
		// In development, just warn about missing or placeholder Stripe keys
		if Env.StripeSecretKey == "" || strings.Contains(Env.StripeSecretKey, "placeholder") {
			log.Println("⚠️ WARNING: STRIPE_SECRET_KEY not configured - payment functionality will not work")
		}
		if Env.StripePriceMensuel == "" || strings.Contains(Env.StripePriceMensuel, "placeholder") {
			log.Println("⚠️ WARNING: STRIPE_PRICE_MENSUEL not configured - monthly subscription will not work")
		}
		if Env.StripePriceAnnuel == "" || strings.Contains(Env.StripePriceAnnuel, "placeholder") {
			log.Println("⚠️ WARNING: STRIPE_PRICE_ANNUEL not configured - yearly subscription will not work")
		}
		if Env.StripeWebhookSecret == "" || strings.Contains(Env.StripeWebhookSecret, "placeholder") {
			log.Println("⚠️ WARNING: STRIPE_WEBHOOK_SECRET not configured - webhook validation will not work")
		}
	}
}

func (env *EnvConfig) GetDatabaseDSN() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		env.DBHost, env.DBPort, env.DBUser, env.DBPassword, env.DBName)
}

func (env *EnvConfig) IsProduction() bool {
	return env.GinMode == "release"
}

func (env *EnvConfig) IsDevelopment() bool {
	return env.GinMode == "debug"
}