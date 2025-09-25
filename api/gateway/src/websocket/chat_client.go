package websocket

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"sync"
	"time"

	"gateway/src/services"
	"github.com/gorilla/websocket"
)

// ChatServiceClient manages the WebSocket connection to the chat service
type ChatServiceClient struct {
	conn            *websocket.Conn
	connected       bool
	mutex           sync.RWMutex
	reconnectDelay  time.Duration
	maxReconnects   int
	reconnectCount  int
	stopChan        chan bool
	messageChan     chan ChatServiceMessage
	responseHandlers map[string]chan ChatServiceResponse
	handlerMutex    sync.RWMutex
}

// ChatServiceMessage represents a message sent to the chat service
type ChatServiceMessage struct {
	Type           string                 `json:"type"`
	UserID         string                 `json:"user_id"`
	ConversationID string                 `json:"conversation_id"`
	Content        string                 `json:"content,omitempty"`
	Token          string                 `json:"token,omitempty"`
	RequestID      string                 `json:"request_id,omitempty"`
	Data           map[string]interface{} `json:"data,omitempty"`
}

// ChatServiceResponse represents a response from the chat service
type ChatServiceResponse struct {
	Type           string                 `json:"type"`
	RequestID      string                 `json:"request_id,omitempty"`
	Status         string                 `json:"status,omitempty"`
	Message        string                 `json:"message,omitempty"`
	ConversationID string                 `json:"conversation_id,omitempty"`
	UserID         string                 `json:"user_id,omitempty"`
	Data           map[string]interface{} `json:"data,omitempty"`
	Error          string                 `json:"error,omitempty"`
}

var (
	GlobalChatClient *ChatServiceClient
	clientOnce       sync.Once
)

// InitChatServiceClient initializes the global chat service client
func InitChatServiceClient() *ChatServiceClient {
	clientOnce.Do(func() {
		GlobalChatClient = NewChatServiceClient()
		go GlobalChatClient.Start()
	})
	return GlobalChatClient
}

// NewChatServiceClient creates a new chat service client
func NewChatServiceClient() *ChatServiceClient {
	return &ChatServiceClient{
		reconnectDelay:   5 * time.Second,
		maxReconnects:    10,
		stopChan:         make(chan bool),
		messageChan:      make(chan ChatServiceMessage, 100),
		responseHandlers: make(map[string]chan ChatServiceResponse),
	}
}

// Start starts the chat service client with automatic reconnection
func (c *ChatServiceClient) Start() {
	for {
		select {
		case <-c.stopChan:
			log.Println("🛑 Chat service client stopped")
			return
		default:
			if err := c.connect(); err != nil {
				log.Printf("❌ Failed to connect to chat service: %v", err)
				if c.reconnectCount >= c.maxReconnects {
					log.Printf("🚫 Max reconnection attempts reached, stopping")
					return
				}
				c.reconnectCount++
				log.Printf("🔄 Reconnecting in %v (attempt %d/%d)", c.reconnectDelay, c.reconnectCount, c.maxReconnects)
				time.Sleep(c.reconnectDelay)
				continue
			}

			// Reset reconnection count on successful connection
			c.reconnectCount = 0

			// Start message handling goroutines
			go c.readMessages()
			go c.writeMessages()

			// Wait for disconnection
			c.waitForDisconnection()
		}
	}
}

// connect establishes a WebSocket connection to the chat service
func (c *ChatServiceClient) connect() error {
	// Get chat service configuration
	chatService, exists := services.GetService("chat")
	if !exists {
		return fmt.Errorf("chat service not configured")
	}

	// Convert HTTP URL to WebSocket URL
	u, err := url.Parse(chatService.URL)
	if err != nil {
		return fmt.Errorf("invalid chat service URL: %w", err)
	}

	// Convert to WebSocket scheme
	if u.Scheme == "http" {
		u.Scheme = "ws"
	} else if u.Scheme == "https" {
		u.Scheme = "wss"
	}

	// Use the gateway WebSocket endpoint
	u.Path = "/api/v1/chat/gateway-ws"

	// Create WebSocket connection
	headers := http.Header{}
	headers.Set("X-Gateway-Client", "true")

	conn, _, err := websocket.DefaultDialer.Dial(u.String(), headers)
	if err != nil {
		return fmt.Errorf("failed to dial chat service: %w", err)
	}

	c.mutex.Lock()
	c.conn = conn
	c.connected = true
	c.mutex.Unlock()

	log.Printf("✅ Connected to chat service via WebSocket: %s", u.String())
	return nil
}

// readMessages handles incoming messages from the chat service
func (c *ChatServiceClient) readMessages() {
	defer func() {
		c.mutex.Lock()
		c.connected = false
		c.mutex.Unlock()
	}()

	for {
		c.mutex.RLock()
		conn := c.conn
		connected := c.connected
		c.mutex.RUnlock()

		if !connected {
			break
		}

		var response ChatServiceResponse
		if err := conn.ReadJSON(&response); err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("❌ Chat service WebSocket read error: %v", err)
			}
			break
		}

		// Handle the response
		c.handleResponse(response)
	}
}

// writeMessages handles outgoing messages to the chat service
func (c *ChatServiceClient) writeMessages() {
	defer func() {
		c.mutex.Lock()
		if c.conn != nil {
			c.conn.Close()
		}
		c.connected = false
		c.mutex.Unlock()
	}()

	for {
		select {
		case message := <-c.messageChan:
			c.mutex.RLock()
			conn := c.conn
			connected := c.connected
			c.mutex.RUnlock()

			if !connected {
				log.Printf("⚠️ Cannot send message, not connected to chat service")
				return
			}

			if err := conn.WriteJSON(message); err != nil {
				log.Printf("❌ Failed to send message to chat service: %v", err)
				return
			}

			log.Printf("📤 Sent message to chat service: type=%s, user=%s", message.Type, message.UserID)

		case <-c.stopChan:
			return
		}
	}
}

// handleResponse processes responses from the chat service
func (c *ChatServiceClient) handleResponse(response ChatServiceResponse) {
	log.Printf("📥 Received from chat service: type=%s, status=%s", response.Type, response.Status)

	switch response.Type {
	case "chat_message":
		// Broadcast the message to appropriate users via Gateway's WebSocket manager
		c.broadcastChatMessage(response)

	case "chat_ack":
		// Forward acknowledgment to the sender
		c.forwardAcknowledgment(response)

	case "user_status":
		// Handle user status updates
		c.handleUserStatus(response)

	case "response":
		// Handle request responses
		if response.RequestID != "" {
			c.forwardResponse(response)
		}

	default:
		log.Printf("⚠️ Unknown response type from chat service: %s", response.Type)
	}
}

// broadcastChatMessage broadcasts a chat message to appropriate users
func (c *ChatServiceClient) broadcastChatMessage(response ChatServiceResponse) {
	if response.ConversationID == "" {
		log.Printf("⚠️ Chat message missing conversation_id")
		return
	}

	// Use the existing GlobalManager to broadcast
	channelName := fmt.Sprintf("chat_%s", response.ConversationID)

	messageData := map[string]interface{}{
		"conversation_id": response.ConversationID,
		"message":        response.Message,
		"from_user":      response.UserID,
		"timestamp":      time.Now().Unix(),
		"type":           "chat_message",
	}

	if response.Data != nil {
		for k, v := range response.Data {
			// Ne pas écraser le timestamp avec l'ancien format
			if k != "timestamp" {
				messageData[k] = v
			}
		}
	}

	GlobalManager.SendToChannel(channelName, "chat_message", messageData, response.UserID)
	log.Printf("📢 Broadcasted chat message to channel: %s", channelName)
}

// forwardAcknowledgment forwards acknowledgment to the original sender
func (c *ChatServiceClient) forwardAcknowledgment(response ChatServiceResponse) {
	if response.UserID == "" {
		log.Printf("⚠️ Chat acknowledgment missing user_id")
		return
	}

	ackData := map[string]interface{}{
		"status":          response.Status,
		"timestamp":       time.Now().Unix(),
		"conversation_id": response.ConversationID,
	}

	if response.Data != nil {
		for k, v := range response.Data {
			ackData[k] = v
		}
	}

	GlobalManager.SendToUser(response.UserID, "chat_ack", ackData)
	log.Printf("✅ Forwarded acknowledgment to user: %s", response.UserID)
}

// handleUserStatus handles user status updates
func (c *ChatServiceClient) handleUserStatus(response ChatServiceResponse) {
	// This can be extended to handle user online/offline status
	log.Printf("👤 User status update: %s", response.UserID)
}

// forwardResponse forwards request responses to waiting handlers
func (c *ChatServiceClient) forwardResponse(response ChatServiceResponse) {
	c.handlerMutex.RLock()
	responseChan, exists := c.responseHandlers[response.RequestID]
	c.handlerMutex.RUnlock()

	if exists {
		select {
		case responseChan <- response:
		case <-time.After(5 * time.Second):
			log.Printf("⚠️ Timeout forwarding response for request: %s", response.RequestID)
		}

		// Clean up the handler
		c.handlerMutex.Lock()
		delete(c.responseHandlers, response.RequestID)
		close(responseChan)
		c.handlerMutex.Unlock()
	}
}

// waitForDisconnection waits for the connection to be lost
func (c *ChatServiceClient) waitForDisconnection() {
	for {
		c.mutex.RLock()
		connected := c.connected
		c.mutex.RUnlock()

		if !connected {
			break
		}

		time.Sleep(1 * time.Second)
	}
}

// SendMessage sends a message to the chat service
func (c *ChatServiceClient) SendMessage(userID, conversationID, content, token string) error {
	c.mutex.RLock()
	connected := c.connected
	c.mutex.RUnlock()

	if !connected {
		return fmt.Errorf("not connected to chat service")
	}

	message := ChatServiceMessage{
		Type:           "chat_message",
		UserID:         userID,
		ConversationID: conversationID,
		Content:        content,
		Token:          token,
		RequestID:      generateRequestID(),
	}

	select {
	case c.messageChan <- message:
		return nil
	case <-time.After(5 * time.Second):
		return fmt.Errorf("timeout sending message")
	}
}

// IsConnected returns whether the client is connected
func (c *ChatServiceClient) IsConnected() bool {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	return c.connected
}

// Stop stops the chat service client
func (c *ChatServiceClient) Stop() {
	close(c.stopChan)

	c.mutex.Lock()
	if c.conn != nil {
		c.conn.Close()
	}
	c.mutex.Unlock()
}

// generateRequestID generates a unique request ID
func generateRequestID() string {
	return fmt.Sprintf("req_%d", time.Now().UnixNano())
}