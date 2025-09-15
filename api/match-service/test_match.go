package main

import (
	"fmt"
	"log"
	"match-service/src/conf"
	"match-service/src/services"
)

func main() {
	// Initialize database connection
	conf.InitDB()

	// Create preference service
	preferencesService := services.NewPreferencesService()

	fmt.Println("Testing mutual match creation...")

	// Test scenario: User 1 likes User 2, then User 2 likes User 1 back

	// First like: User 1 likes User 2
	fmt.Println("\n1. User 1 likes User 2")
	result1, err := preferencesService.RecordInteraction(1, 2, "like")
	if err != nil {
		log.Fatalf("Error recording first like: %v", err)
	}
	fmt.Printf("Result 1: %+v\n", result1)

	// Second like: User 2 likes User 1 back (should create match)
	fmt.Println("\n2. User 2 likes User 1 back")
	result2, err := preferencesService.RecordInteraction(2, 1, "like")
	if err != nil {
		log.Fatalf("Error recording second like: %v", err)
	}
	fmt.Printf("Result 2: %+v\n", result2)

	// Check if match was created
	if matchCreated, exists := result2["match_created"]; exists && matchCreated == true {
		fmt.Printf("✅ SUCCESS: Match created with ID %v\n", result2["match_id"])
	} else {
		fmt.Printf("❌ FAILURE: No match was created\n")
	}
}