package conf

import (
	"fmt"
	"log"
	"os"

	"chat-service/src/models"
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

		// Migrate chat service tables
		err := DB.AutoMigrate(
			&models.Message{},
			&models.Discussion{},
			&models.MessageReaction{},
			&models.UserPresence{},
		)
		if err != nil {
			log.Printf("Migration error: %v", err)
		}

		// Create unique constraint for message reactions (one reaction per user per message per emoji)
		DB.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_message_reactions_unique
				  ON message_reactions (message_id, user_id, emoji)`)

		// Create index for better performance on presence queries
		DB.Exec(`CREATE INDEX IF NOT EXISTS idx_user_presence_activity
				  ON user_presence (is_online, last_activity)`)

		log.Println("Chat service migration completed")
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}