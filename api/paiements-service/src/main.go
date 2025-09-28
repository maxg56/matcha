package main

import (
    "log"
    "os"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "github.com/gin-contrib/cors"
    "github.com/matcha/api/paiements-service/src/stripe"
)

func main() {
    // Charger le .env
    if err := godotenv.Load(".env"); err != nil {
        log.Println("No .env file found, relying on environment variables")
        log.Println(os.Getenv("STRIPE_PRICE_MENSUEL"))
        log.Println(os.Getenv("STRIPE_PRICE_ANNUEL"))
    }

    r := gin.Default()

    // Middleware CORS
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:5173"}, // ton frontend
        AllowMethods:     []string{"POST", "GET", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

    // Enregistrer les routes Stripe
    stripe.RegisterRoutes(r)

    port := os.Getenv("PAYOUT_SERVICE_PORT")
    if port == "" {
        port = "8085" // port par défaut pour le microservice paiement
    }

    log.Printf("Paiement service running on :%s", port)
    r.Run(":" + port)
}
