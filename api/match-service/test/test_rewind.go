package main

import (
	"encoding/json"
	"fmt"
	"log"

	"match-service/src/conf"
	"match-service/src/services"
)

func main() {
	// Initialize database
	conf.InitDB()

	// Test RewindService functionality
	rewindService := services.NewRewindService()

	// Test with a dummy user ID
	userID := 1

	fmt.Println("Testing Rewind Service...")
	fmt.Println("========================")

	// Test 1: Check rewind availability for a user with no recent interactions
	fmt.Println("Test 1: Check rewind availability (no recent interactions)")
	availability, err := rewindService.GetRewindAvailability(userID)
	if err != nil {
		log.Printf("Error: %v", err)
	} else {
		jsonOutput, _ := json.MarshalIndent(availability, "", "  ")
		fmt.Printf("Result: %s\n\n", jsonOutput)
	}

	// Test 2: Try to perform rewind (should fail)
	fmt.Println("Test 2: Try to perform rewind (should fail)")
	err = rewindService.PerformRewind(userID)
	if err != nil {
		fmt.Printf("Expected error: %v\n\n", err)
	} else {
		fmt.Println("Unexpected success!\n")
	}

	// Test 3: Cleanup expired rewinds
	fmt.Println("Test 3: Cleanup expired rewinds")
	err = rewindService.CleanupExpiredRewinds()
	if err != nil {
		log.Printf("Error: %v", err)
	} else {
		fmt.Println("Cleanup completed successfully")
	}

	fmt.Println("\nRewind Service test completed!")
}