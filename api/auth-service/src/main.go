package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	db "auth-service/src/conf"
	"auth-service/src/handlers"
)

func main() {
	// Initialize database (will AutoMigrate models)
	db.ConnectDatabase()

	// Initialize Redis for token blacklisting
	if err := db.InitRedis(); err != nil {
		log.Printf("Failed to initialize Redis: %v", err)
		log.Println("Redis initialization failed - tokens will not be blacklisted on logout")
	} else {
		log.Println("Redis initialized successfully for token blacklisting")
	}

	r := gin.Default()

	// Health check
	r.GET("/health", handlers.HealthCheckHandler)

	// API routes
	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/check-availability", handlers.CheckAvailabilityHandler)
			auth.POST("/register", handlers.RegisterHandler)
			auth.POST("/login", handlers.LoginHandler)
			auth.POST("/logout", handlers.LogoutHandler)
			auth.POST("/refresh", handlers.RefreshTokenHandler)
			auth.GET("/verify", handlers.VerifyTokenHandler)
			auth.POST("/forgot-password", handlers.ForgotPasswordHandler)
			auth.POST("/reset-password", handlers.ResetPasswordHandler)
			auth.POST("/send-email-verification", handlers.SendEmailVerificationHandler)
			auth.POST("/verify-email", handlers.VerifyEmailHandler)
		}
	}

	log.Println("Auth service starting on port 8001")
	log.Fatal(http.ListenAndServe(":8001", r))
}
