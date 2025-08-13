package main

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"

	db "auth-service/src/conf"
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
	// Register routes
	registerRoutes(r)

	log.Println("Auth service starting on port 8001")
	log.Fatal(http.ListenAndServe(":8001", r))
}
