package main

import (
    "log"
    "os"
    "os/signal"
    "syscall"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "github.com/matcha/api/paiements-service/src/conf"
    "github.com/matcha/api/paiements-service/src/middleware"
    "github.com/matcha/api/paiements-service/src/routes"
)

func main() {
    // Charger le .env
    if err := godotenv.Load("../../../.env"); err != nil {
        log.Println("No .env file found, relying on environment variables")
    }

    // Initialiser la base de données
    if err := conf.InitDatabase(); err != nil {
        log.Fatalf("Failed to initialize database: %v", err)
    }
    defer conf.CloseDatabase()

    // Configuration Gin selon l'environnement
    if os.Getenv("GIN_MODE") == "release" {
        gin.SetMode(gin.ReleaseMode)
    }

    r := gin.Default()

    // Configuration des proxies de confiance
    r.SetTrustedProxies([]string{"127.0.0.1", "::1", "172.16.0.0/12", "192.168.0.0/16", "10.0.0.0/8"})

    // Middlewares globaux
    r.Use(middleware.CORSMiddleware())
    r.Use(middleware.RequestLoggerMiddleware())

    // Configurer toutes les routes
    routes.SetupRoutes(r)

    // Routes configurées via routes.SetupRoutes() avec le système complet

    // Configuration du port
    port := os.Getenv("PAIEMENTS_SERVICE_PORT")
    if port == "" {
        port = "8085" // port par défaut pour le service paiements
    }

    log.Printf("🚀 Paiements service started on port %s", port)
    log.Printf("📊 Health check: http://localhost:%s/health", port)
    log.Printf("🔗 Stripe webhooks: http://localhost:%s/api/stripe/webhook", port)

    // Démarrer le serveur dans une goroutine
    go func() {
        if err := r.Run(":" + port); err != nil {
            log.Fatalf("Failed to start server: %v", err)
        }
    }()

    // Attendre le signal d'arrêt graceful
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("🛑 Shutting down payment service...")
    // Ici on pourrait ajouter du cleanup si nécessaire
    log.Println("✅ Payment service stopped")
}
