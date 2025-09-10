package conf

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/matcha/api/paiements-service/src/models"
)

var DB *gorm.DB

func InitDB() {
	var err error

	// Database configuration
	host := getEnvWithDefault("DB_HOST", "localhost")
	port := getEnvWithDefault("DB_PORT", "5432")
	user := getEnvWithDefault("DB_USER", "postgres")
	password := getEnvWithDefault("DB_PASSWORD", "password")
	dbname := getEnvWithDefault("DB_NAME", "matcha_dev")

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate tables if environment variable is set
	if getEnvWithDefault("AUTO_MIGRATE", "false") == "true" {
		if err := autoMigrate(); err != nil {
			log.Fatal("Failed to auto-migrate:", err)
		}
	}

	log.Println("Payment service database connection established successfully")
}

func autoMigrate() error {
	return DB.AutoMigrate(
		&models.Subscription{},
		&models.Payment{},
		&models.StripeEvent{},
	)
}

func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}