package conf

import (
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

	// Use centralized environment configuration
	dsn := Env.GetDatabaseDSN()

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate tables if environment variable is set
	if Env.AutoMigrate == "true" {
		log.Println("Running DB AutoMigrate (AUTO_MIGRATE=true)")
		if err := autoMigrate(); err != nil {
			log.Fatal("❌ AutoMigrate failed:", err)
		} else {
			log.Println("✅ Database tables migrated successfully")
		}
	} else {
		log.Println("Skipping AutoMigrate (set AUTO_MIGRATE=true to enable)")
	}

	log.Println("✅ Payment service database connection established successfully")
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