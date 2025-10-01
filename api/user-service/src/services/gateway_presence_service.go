package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

// GatewayPresenceService handles communication with Gateway for real-time WebSocket presence
type GatewayPresenceService struct {
	gatewayURL string
	httpClient *http.Client
}

// GatewayOnlineStatusResponse represents the response from Gateway WebSocket status endpoint
type GatewayOnlineStatusResponse struct {
	Success  bool      `json:"success"`
	UserID   string    `json:"user_id"`
	IsOnline bool      `json:"is_online"`
	LastPing time.Time `json:"last_ping,omitempty"`
	Error    string    `json:"error,omitempty"`
}

// NewGatewayPresenceService creates a new Gateway Presence Service
func NewGatewayPresenceService() *GatewayPresenceService {
	gatewayURL := os.Getenv("GATEWAY_URL")
	if gatewayURL == "" {
		gatewayURL = "http://gateway:8080" // Default for Docker environment
	}

	return &GatewayPresenceService{
		gatewayURL: gatewayURL,
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// GetUserWebSocketStatus gets real-time WebSocket connection status from Gateway
func (s *GatewayPresenceService) GetUserWebSocketStatus(userID uint) (*UserPresence, error) {
	url := fmt.Sprintf("%s/api/internal/users/%d/online-status", s.gatewayURL, userID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Add internal service header for authentication (if required by middleware)
	req.Header.Set("X-Internal-Service", "user-service")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call Gateway: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Gateway returned status %d", resp.StatusCode)
	}

	var gwResponse GatewayOnlineStatusResponse
	if err := json.NewDecoder(resp.Body).Decode(&gwResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if !gwResponse.Success {
		return nil, fmt.Errorf("Gateway error: %s", gwResponse.Error)
	}

	// Convert Gateway response to UserPresence format
	presence := &UserPresence{
		UserID:       userID,
		IsOnline:     gwResponse.IsOnline,
		LastActivity: time.Now(),
	}

	// If user is offline and we don't have last seen, set it to last ping time
	if !gwResponse.IsOnline && !gwResponse.LastPing.IsZero() {
		presence.LastSeen = &gwResponse.LastPing
	}

	return presence, nil
}

// IsGatewayAvailable checks if the Gateway is reachable
func (s *GatewayPresenceService) IsGatewayAvailable() bool {
	url := fmt.Sprintf("%s/api/internal/health", s.gatewayURL)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false
	}

	req.Header.Set("X-Internal-Service", "user-service")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	return resp.StatusCode == http.StatusOK
}