package websocket

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"gateway/src/config"
	"gateway/src/services"
)

// ServiceClient handles HTTP calls to backend services
type ServiceClient struct {
	client *http.Client
}

// NewServiceClient creates a new service client with configured timeouts
func NewServiceClient() *ServiceClient {
	timeout := 10 * time.Second
	if config.GlobalConfig != nil {
		timeout = config.GlobalConfig.HTTPTimeout
	}
	
	return &ServiceClient{
		client: &http.Client{
			Timeout: timeout,
		},
	}
}

var serviceClient = NewServiceClient()

// validateUserInConversation checks if user has access to the conversation via chat service
func validateUserInConversation(userID, conversationID, token string) bool {
	// Get chat service configuration
	chatService, exists := services.GetService("chat")
	if !exists {
		LogError(userID, "chat_service_unavailable", fmt.Errorf("chat service not configured"))
		return false
	}
	
	// Prepare the validation request
	url := fmt.Sprintf("%s/api/v1/chat/conversations/%s/validate", chatService.URL, conversationID)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		LogError(userID, "chat_validation_request_error", err)
		return false
	}
	
	// Add authentication headers
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("X-User-ID", userID)
	req.Header.Set("Content-Type", "application/json")
	
	// Make the request
	resp, err := serviceClient.client.Do(req)
	if err != nil {
		LogError(userID, "chat_validation_network_error", err)
		return false
	}
	defer resp.Body.Close()
	
	// Check response status
	switch resp.StatusCode {
	case http.StatusOK:
		LogMessage(userID, "chat_validation_success", "conversation:", conversationID)
		return true
	case http.StatusForbidden, http.StatusUnauthorized:
		LogError(userID, "chat_validation_access_denied", 
			fmt.Errorf("access denied to conversation %s, status: %d", conversationID, resp.StatusCode))
		return false
	case http.StatusNotFound:
		LogError(userID, "chat_validation_not_found", 
			fmt.Errorf("conversation %s not found, status: %d", conversationID, resp.StatusCode))
		return false
	default:
		LogError(userID, "chat_validation_error", 
			fmt.Errorf("validation failed for conversation %s, status: %d", conversationID, resp.StatusCode))
		return false
	}
}

// markNotificationAsRead calls the notification service to mark a notification as read
func markNotificationAsRead(userID, notificationID, token string) error {
	// Get notification service configuration
	notifyService, exists := services.GetService("notify")
	if !exists {
		return fmt.Errorf("notification service not configured")
	}
	
	// Prepare the request
	url := fmt.Sprintf("%s/api/v1/notifications/%s/read", notifyService.URL, notificationID)
	
	req, err := http.NewRequest("PUT", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	
	// Add authentication headers
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("X-User-ID", userID)
	req.Header.Set("Content-Type", "application/json")
	
	// Make the request
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	req = req.WithContext(ctx)
	
	resp, err := serviceClient.client.Do(req)
	if err != nil {
		return fmt.Errorf("network error: %w", err)
	}
	defer resp.Body.Close()
	
	// Check response
	switch resp.StatusCode {
	case http.StatusOK, http.StatusNoContent:
		LogMessage(userID, "notification_marked_read", "notification_id:", notificationID)
		return nil
	case http.StatusNotFound:
		return fmt.Errorf("notification %s not found", notificationID)
	case http.StatusForbidden:
		return fmt.Errorf("access denied to notification %s", notificationID)
	default:
		// Try to read error message from response
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to mark notification as read (status %d): %s", resp.StatusCode, string(body))
	}
}

// markAllNotificationsAsRead calls the notification service to mark all notifications as read
func markAllNotificationsAsRead(userID, token string) error {
	// Get notification service configuration
	notifyService, exists := services.GetService("notify")
	if !exists {
		return fmt.Errorf("notification service not configured")
	}
	
	// Prepare the request
	url := fmt.Sprintf("%s/api/v1/notifications/read-all", notifyService.URL)
	
	req, err := http.NewRequest("PUT", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	
	// Add authentication headers
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("X-User-ID", userID)
	req.Header.Set("Content-Type", "application/json")
	
	// Make the request
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	req = req.WithContext(ctx)
	
	resp, err := serviceClient.client.Do(req)
	if err != nil {
		return fmt.Errorf("network error: %w", err)
	}
	defer resp.Body.Close()
	
	// Check response
	switch resp.StatusCode {
	case http.StatusOK, http.StatusNoContent:
		LogMessage(userID, "all_notifications_marked_read")
		return nil
	case http.StatusForbidden:
		return fmt.Errorf("access denied")
	default:
		// Try to read error message from response
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to mark all notifications as read (status %d): %s", resp.StatusCode, string(body))
	}
}

// sendMessageToChatService sends a message to the chat service for persistence
func sendMessageToChatService(userID, conversationID, message, token string) error {
	// Get chat service configuration
	chatService, exists := services.GetService("chat")
	if !exists {
		return fmt.Errorf("chat service not configured")
	}
	
	// Prepare message payload
	payload := map[string]any{
		"conversation_id": conversationID,
		"message":        message,
		"from_user":      userID,
		"timestamp":      time.Now().Unix(),
	}
	
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}
	
	// Prepare the request
	url := fmt.Sprintf("%s/api/v1/chat/conversations/%s/messages", chatService.URL, conversationID)
	
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	
	// Add authentication headers
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("X-User-ID", userID)
	req.Header.Set("Content-Type", "application/json")
	
	// Make the request
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	req = req.WithContext(ctx)
	
	resp, err := serviceClient.client.Do(req)
	if err != nil {
		return fmt.Errorf("network error: %w", err)
	}
	defer resp.Body.Close()
	
	// Check response
	if resp.StatusCode == http.StatusCreated || resp.StatusCode == http.StatusOK {
		LogMessage(userID, "message_persisted", "conversation:", conversationID)
		return nil
	} else {
		// Try to read error message from response
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to persist message (status %d): %s", resp.StatusCode, string(body))
	}
}