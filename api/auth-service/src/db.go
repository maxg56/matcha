package main

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	// local models
	models "auth-service/src/models"
)

var DB *gorm.DB

type db_config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

func ConnectDatabase() {
	config := db_config{
		Host:     GetenvOrDefault("DB_HOST", "localhost"),
		Port:     GetenvOrDefault("DB_PORT", "5432"),
		User:     GetenvOrDefault("DB_USER", "postgres"),
		Password: GetenvOrDefault("DB_PASSWORD", "pass"),
		DBName:   GetenvOrDefault("DB_NAME", "testdb"),
	}

	dsn := "host=" + config.Host + " user=" + config.User + " password=" + config.Password + " dbname=" + config.DBName + " port=" + config.Port + " sslmode=disable"
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Erreur connexion DB:", err)
	}

	DB = database
	log.Println("✅ Base de données connectée")

	// Auto-migrate schemas to keep in sync with init.sql
	if err := DB.AutoMigrate(
		&models.User{},
		&models.Tag{},
		&models.UserTag{},
		&models.Image{},
		&models.Relation{},
		&models.Discussion{},
		&models.Message{},
	); err != nil {
		log.Println("⚠️ AutoMigrate failed:", err)
	}
}

func GetenvOrDefault(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}