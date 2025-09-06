package conf

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"match-service/src/models"
)

var DB *gorm.DB

func InitDB() {
	var err error

	// Database connection parameters with defaults
	dbHost := getEnv("DB_HOST", "localhost")
	dbUser := getEnv("DB_USER", "postgres")
	dbPassword := getEnv("DB_PASSWORD", "password")
	dbName := getEnv("DB_NAME", "matcha_dev")
	dbPort := getEnv("DB_PORT", "5432")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		dbHost, dbUser, dbPassword, dbName, dbPort)

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Printf("Connected to database: %s@%s:%s/%s", dbUser, dbHost, dbPort, dbName)

	// Auto-migrate models if enabled
	if getEnv("AUTO_MIGRATE", "false") == "true" {
		err = DB.AutoMigrate(
			&models.User{},
			&models.UserTag{},
			&models.Tag{},
			&models.Image{},
			&models.UserInteraction{},
			&models.Match{},
		)
		if err != nil {
			log.Fatalf("Failed to auto-migrate: %v", err)
		}
		log.Println("Database auto-migration completed")
	}
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}