package conf

import (
	"fmt"
	"log"
	"os"

	"media-service/src/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// ConnectDatabase initializes the database connection and runs auto-migration
func ConnectDatabase() {
	// Get database configuration from environment variables
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "password")
	dbname := getEnv("DB_NAME", "matcha_dev")

	// Construct DSN
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	log.Printf("Database URL: postgresql://%s:%s@%s:%s/%s", user, password, host, port, dbname)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")

	// Auto-migrate if enabled
	if getEnv("AUTO_MIGRATE", "true") == "true" {
		log.Println("Running auto-migration...")
		err = DB.AutoMigrate(&models.Image{})
		if err != nil {
			log.Fatal("Failed to migrate database:", err)
		}
		log.Println("Database migration completed")
	}
}

// getEnv returns the value of an environment variable or a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}