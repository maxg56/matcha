package main

import (
	"fmt"
	"log"
	"match-service/src/conf"
	"match-service/src/services"
)

func main() {
	// Initialize database connection (using Docker environment)
	conf.InitDB()

	// Clean up test data
	conf.DB.Exec("DELETE FROM matches WHERE (user1_id = 3 AND user2_id = 4) OR (user1_id = 4 AND user2_id = 3)")
	conf.DB.Exec("DELETE FROM user_interactions WHERE (user_id = 3 AND target_user_id = 4) OR (user_id = 4 AND target_user_id = 3)")

	// Create preference service
	preferencesService := services.NewPreferencesService()

	fmt.Println("Testing mutual match creation...")

	// First like: User 3 likes User 4
	fmt.Println("\n1. User 3 likes User 4")
	result1, err := preferencesService.RecordInteraction(3, 4, "like")
	if err != nil {
		log.Fatalf("Error recording first like: %v", err)
	}
	fmt.Printf("Result 1: %+v\n", result1)

	// Second like: User 4 likes User 3 back (should create match)
	fmt.Println("\n2. User 4 likes User 3 back")
	result2, err := preferencesService.RecordInteraction(4, 3, "like")
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
