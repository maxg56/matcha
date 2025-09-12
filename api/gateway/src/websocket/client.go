package websocket

import (
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Client represents a WebSocket client connection
type Client struct {
	ID            string             // User ID
	Conn          *websocket.Conn    // WebSocket connection
	Send          chan []byte        // Buffered channel of outbound messages
	Subscriptions map[string]bool    // Channels this client is subscribed to
	Token         string             // JWT token for service calls
	LastPing      time.Time          // Last ping timestamp
	closed        bool               // Flag to track if client is closed
	mu            sync.RWMutex       // Protect subscriptions map and closed flag
}

// NewClient creates a new WebSocket client
func NewClient(userID string, conn *websocket.Conn) *Client {
	return &Client{
		ID:            userID,
		Conn:          conn,
		Send:          make(chan []byte, 256),
		Subscriptions: make(map[string]bool),
		LastPing:      time.Now(),
	}
}

// IsSubscribed checks if the client is subscribed to a channel
func (c *Client) IsSubscribed(channel string) bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.Subscriptions[channel]
}

// Subscribe adds a subscription for this client
func (c *Client) Subscribe(channel string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.Subscriptions[channel] = true
}

// Unsubscribe removes a subscription for this client
func (c *Client) Unsubscribe(channel string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.Subscriptions, channel)
}

// GetSubscriptions returns a copy of the client's subscriptions
func (c *Client) GetSubscriptions() map[string]bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	
	subscriptions := make(map[string]bool)
	for channel, subscribed := range c.Subscriptions {
		subscriptions[channel] = subscribed
	}
	return subscriptions
}

// UpdateLastPing updates the last ping timestamp
func (c *Client) UpdateLastPing() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.LastPing = time.Now()
}

// GetLastPing returns the last ping timestamp
func (c *Client) GetLastPing() time.Time {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.LastPing
}

// Close closes the client connection and channel
func (c *Client) Close() {
	c.mu.Lock()
	defer c.mu.Unlock()
	
	if c.closed {
		return // Already closed
	}
	
	c.closed = true
	
	// Close the Send channel safely
	defer func() {
		if r := recover(); r != nil {
			// Channel was already closed, ignore the panic
		}
	}()
	close(c.Send)
	
	// Close the WebSocket connection
	if c.Conn != nil {
		c.Conn.Close()
	}
}

// IsClosed returns whether the client is closed
func (c *Client) IsClosed() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.closed
}