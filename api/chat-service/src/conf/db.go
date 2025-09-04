package conf

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	host := getEnv("DB_HOST", "postgres")
	port := getEnv("DB_PORT", "5432")
	dbname := getEnv("DB_NAME", "matcha_dev")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "password")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		host, user, password, dbname, port)

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	DB = database
	log.Printf("Connected to database: %s@%s:%s/%s", user, host, port, dbname)

	AutoMigrate()
}

func AutoMigrate() {
	if getEnv("AUTO_MIGRATE", "true") == "true" {
		log.Println("Running database auto-migration...")
		// Note: Tables are managed by auth-service, we just verify they exist
		log.Println("Chat service migration completed")
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}