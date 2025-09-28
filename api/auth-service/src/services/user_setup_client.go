package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

// UserSetupRequest represents the payload for user setup
type UserSetupRequest struct {
	UserID  uint   `json:"user_id"`
	Age     int    `json:"age"`
	SexPref string `json:"sex_pref"`
}

// CallUserSetup calls the user-service to setup default preferences for a new user
func CallUserSetup(userID uint, age int, sexPref string) error {
	// Get user-service URL from environment or use default
	userServiceURL := os.Getenv("USER_SERVICE_URL")
	if userServiceURL == "" {
		userServiceURL = "http://user-service:8002" // Default Docker service name
	}

	setupRequest := UserSetupRequest{
		UserID:  userID,
		Age:     age,
		SexPref: sexPref,
	}

	jsonData, err := json.Marshal(setupRequest)
	if err != nil {
		return fmt.Errorf("failed to marshal setup request: %w", err)
	}

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Create request
	url := fmt.Sprintf("%s/api/v1/users/setup", userServiceURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create setup request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	// Add dummy auth headers for internal service call
	req.Header.Set("X-User-ID", fmt.Sprintf("%d", userID))

	// Make the request
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to call user setup service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("user setup service returned status: %d", resp.StatusCode)
	}

	return nil
}