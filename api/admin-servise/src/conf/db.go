package conf

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	models "admin-service/src/models"
)

var DB *gorm.DB

func InitDB() {
	host := getenv("DB_HOST", "localhost")
	port := getenv("DB_PORT", "5432")
	user := getenv("DB_USER", "postgres")
	pass := getenv("DB_PASSWORD", "password")
	name := getenv("DB_NAME", "matcha_dev")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC", host, user, pass, name, port)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: logger.Default.LogMode(logger.Info)})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	DB = db
	log.Println("admin-service DB connected")

	if getenv("AUTO_MIGRATE", "true") == "true" {
		if err := DB.AutoMigrate(&models.Admin{}); err != nil {
			log.Printf("AutoMigrate failed: %v", err)
		}
	}
}

func getenv(k, d string) string {
	if v, ok := os.LookupEnv(k); ok && v != "" {
		return v
	}
	return d
}
