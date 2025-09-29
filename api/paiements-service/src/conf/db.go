package conf

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/matcha/api/paiements-service/src/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB instance globale de la base de données
var DB *gorm.DB

// CustomLogger implémente une interface de logger GORM qui filtre "record not found"
type CustomLogger struct {
	logger.Interface
}

// Error surcharge la méthode Error pour filtrer "record not found"
func (l CustomLogger) Error(ctx context.Context, msg string, data ...interface{}) {
	// Ne pas logger "record not found" car c'est un comportement normal
	if len(data) > 0 {
		if err, ok := data[0].(error); ok && errors.Is(err, gorm.ErrRecordNotFound) {
			return
		}
	}
	l.Interface.Error(ctx, msg, data...)
}

// InitDatabase initialise la connexion à la base de données
func InitDatabase() error {
	// Configuration de la base de données depuis les variables d'environnement
	dbConfig := DatabaseConfig{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASSWORD", "password"),
		DBName:   getEnv("DB_NAME", "matcha_dev"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
		TimeZone: getEnv("DB_TIMEZONE", "Europe/Paris"),
	}

	// Construction de la chaîne de connexion DSN
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		dbConfig.Host, dbConfig.User, dbConfig.Password, dbConfig.DBName,
		dbConfig.Port, dbConfig.SSLMode, dbConfig.TimeZone)

	// Configuration du logger GORM avec filtre pour "record not found"
	// En mode production, ne logger que les erreurs graves
	baseLogger := logger.Default.LogMode(logger.Error)
	if getEnv("LOG_LEVEL", "info") == "debug" {
		baseLogger = logger.Default.LogMode(logger.Info)
	}

	gormLogger := CustomLogger{Interface: baseLogger}

	// Connexion à la base de données
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
		NowFunc: func() time.Time {
			return time.Now().Local()
		},
	})

	if err != nil {
		log.Printf("Failed to connect to database: %v", err)
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configuration de la pool de connexions
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get sql.DB from gorm.DB: %w", err)
	}

	// Configuration des paramètres de pool
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Test de la connexion
	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Connected to database successfully")

	// Auto-migration si activée
	if getEnv("AUTO_MIGRATE", "false") == "true" {
		if err := runMigrations(); err != nil {
			log.Printf("Warning: Auto-migration failed: %v", err)
		} else {
			log.Println("Auto-migration completed successfully")
		}
	}

	return nil
}

// runMigrations exécute les migrations automatiques
func runMigrations() error {
	// Créer les types enum PostgreSQL s'ils n'existent pas
	if err := createEnumTypes(); err != nil {
		log.Printf("Warning: Failed to create enum types: %v", err)
	}

	// Exécuter les migrations GORM
	return DB.AutoMigrate(
		&models.User{},
		&models.Subscription{},
		&models.Payment{},
		&models.WebhookEvent{},
	)
}

// createEnumTypes crée les types enum PostgreSQL nécessaires
func createEnumTypes() error {
	enumQueries := []string{
		"CREATE TYPE IF NOT EXISTS subscription_status_enum AS ENUM ('active', 'inactive', 'canceled', 'past_due', 'unpaid')",
		"CREATE TYPE IF NOT EXISTS plan_type_enum AS ENUM ('mensuel', 'annuel')",
		"CREATE TYPE IF NOT EXISTS payment_status_enum AS ENUM ('pending', 'succeeded', 'failed', 'canceled')",
	}

	for _, query := range enumQueries {
		if err := DB.Exec(query).Error; err != nil {
			log.Printf("Failed to create enum type: %s - %v", query, err)
			return err
		}
	}

	log.Println("Enum types created successfully")
	return nil
}

// CloseDatabase ferme la connexion à la base de données
func CloseDatabase() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// DatabaseConfig structure de configuration de la base de données
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
	TimeZone string
}

// getEnv récupère une variable d'environnement avec une valeur par défaut
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// IsConnected vérifie si la base de données est connectée
func IsConnected() bool {
	if DB == nil {
		return false
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return false
	}

	return sqlDB.Ping() == nil
}

// GetDB retourne l'instance de la base de données
func GetDB() *gorm.DB {
	return DB
}