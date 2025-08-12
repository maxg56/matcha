package main

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func main() {
	// Initialize database (will AutoMigrate models)
	ConnectDatabase()
	r := gin.Default()
	// Register routes
	registerRoutes(r)

	log.Println("Auth service starting on port 8001")
	log.Fatal(http.ListenAndServe(":8001", r))
}
