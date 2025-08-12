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
	r := gin.Default()
	// Register routes
	registerRoutes(r)

	log.Println("Auth service starting on port 8001")
	log.Fatal(http.ListenAndServe(":8001", r))
}
