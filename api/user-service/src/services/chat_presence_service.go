package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

// ChatPresenceService handles communication with Chat Service for real-time presence
type ChatPresenceService struct {
	chatServiceURL string
	httpClient     *http.Client
}

// WebSocketStatusResponse represents the response from Chat Service WebSocket status endpoint
type WebSocketStatusResponse struct {
	Success bool `json:"success"`
	Data    struct {
		UserID   uint       `json:"user_id"`
		IsOnline bool       `json:"is_online"`
		LastSeen *time.Time `json:"last_seen,omitempty"`
	} `json:"data"`
	Error string `json:"error,omitempty"`
}

// ChatUserPresence represents user presence information from Chat Service
type ChatUserPresence struct {
	UserID   uint       `json:"user_id"`
	IsOnline bool       `json:"is_online"`
	LastSeen *time.Time `json:"last_seen,omitempty"`
}

// NewChatPresenceService creates a new Chat Presence Service
func NewChatPresenceService() *ChatPresenceService {
	chatServiceURL := os.Getenv("CHAT_SERVICE_URL")
	if chatServiceURL == "" {
		chatServiceURL = "http://chat-service:8004" // Default for Docker environment
	}

	return &ChatPresenceService{
		chatServiceURL: chatServiceURL,
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// GetUserWebSocketStatus gets real-time WebSocket connection status from Chat Service
func (s *ChatPresenceService) GetUserWebSocketStatus(userID uint) (*ChatUserPresence, error) {
	url := fmt.Sprintf("%s/api/v1/chat/users/%d/websocket-status", s.chatServiceURL, userID)

	resp, err := s.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to call Chat Service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Chat Service returned status %d", resp.StatusCode)
	}

	var wsResponse WebSocketStatusResponse
	if err := json.NewDecoder(resp.Body).Decode(&wsResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if !wsResponse.Success {
		return nil, fmt.Errorf("Chat Service error: %s", wsResponse.Error)
	}

	return &ChatUserPresence{
		UserID:   wsResponse.Data.UserID,
		IsOnline: wsResponse.Data.IsOnline,
		LastSeen: wsResponse.Data.LastSeen,
	}, nil
}