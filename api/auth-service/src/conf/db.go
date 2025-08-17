package conf

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
		Password: GetenvOrDefault("DB_PASSWORD", "password"),
		DBName:   GetenvOrDefault("DB_NAME", "matcha_dev"),
	}

	dsn := "host=" + config.Host + " user=" + config.User + " password=" + config.Password + " dbname=" + config.DBName + " port=" + config.Port + " sslmode=disable"
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Erreur connexion DB:", err)
	}

	DB = database
	log.Println("✅ Base de données connectée")

	// Optional: enable automatic migrations only when explicitly requested
	if os.Getenv("AUTO_MIGRATE") == "true" {
		log.Println("Running DB AutoMigrate (AUTO_MIGRATE=true)")
		if err := DB.AutoMigrate(
			&models.Users{},
			&models.Tag{},
			&models.UserTag{},
			&models.Image{},
			&models.Relation{},
			&models.Discussion{},
			&models.Message{},
		); err != nil {
			log.Println("⚠️ AutoMigrate failed:", err)
		}
	} else {
		log.Println("Skipping AutoMigrate (set AUTO_MIGRATE=true to enable)")
	}
}

func GetenvOrDefault(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
