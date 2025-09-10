package websocket

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"
)

// Manager maintains the set of active clients and broadcasts messages to them
type Manager struct {
	clients    map[string]*Client                // Connected clients by user ID
	broadcast  chan BroadcastMessage             // Inbound messages from clients
	register   chan *Client                      // Register requests from clients
	unregister chan *Client                      // Unregister requests from clients
	channels   map[string]map[string]*Client     // Channel subscriptions: channel -> userID -> client
	mu         sync.RWMutex                      // Protect maps
	ctx        context.Context                   // Context for graceful shutdown
	cancel     context.CancelFunc                // Cancel function
}

// BroadcastMessage represents a message to be broadcasted
type BroadcastMessage struct {
	Type     string `json:"type"`
	Data     any    `json:"data"`
	Channel  string `json:"channel,omitempty"`  // Target channel
	UserID   string `json:"user_id,omitempty"`  // Target specific user
	FromUser string `json:"from_user,omitempty"` // Sender user ID
}

// Global manager instance
var GlobalManager *Manager

// NewManager creates a new WebSocket connection manager
func NewManager() *Manager {
	ctx, cancel := context.WithCancel(context.Background())
	return &Manager{
		clients:    make(map[string]*Client),
		broadcast:  make(chan BroadcastMessage, 256),
		register:   make(chan *Client, 10),
		unregister: make(chan *Client, 10),
		channels:   make(map[string]map[string]*Client),
		ctx:        ctx,
		cancel:     cancel,
	}
}

// InitManager initializes the global manager and starts it
func InitManager() {
	GlobalManager = NewManager()
	go GlobalManager.Run()
	
	// Initialize notification client to receive notifications from notify-service
	InitNotificationClient()
	
	log.Println("WebSocket Manager initialized and running")
}

// Run starts the manager's main loop
func (m *Manager) Run() {
	// Start cleanup ticker
	cleanupTicker := time.NewTicker(5 * time.Minute)
	defer cleanupTicker.Stop()
	
	for {
		select {
		case client := <-m.register:
			m.registerClient(client)
			
		case client := <-m.unregister:
			m.unregisterClient(client)
			
		case message := <-m.broadcast:
			m.broadcastMessage(message)
			
		case <-cleanupTicker.C:
			m.cleanupStaleConnections()
			
		case <-m.ctx.Done():
			log.Println("WebSocket Manager shutting down...")
			m.shutdown()
			return
		}
	}
}

// cleanupStaleConnections removes clients with stale connections
func (m *Manager) cleanupStaleConnections() {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	staleThreshold := 2 * time.Minute
	now := time.Now()
	
	for userID, client := range m.clients {
		if now.Sub(client.GetLastPing()) > staleThreshold {
			log.Printf("Removing stale connection for user %s", userID)
			m.unregisterClientUnsafe(client)
		}
	}
}

// shutdown gracefully shuts down the manager
func (m *Manager) shutdown() {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	// Close all client connections
	for _, client := range m.clients {
		client.Close()
	}
	
	// Clear maps
	m.clients = make(map[string]*Client)
	m.channels = make(map[string]map[string]*Client)
	
	log.Println("WebSocket Manager shutdown complete")
}

// Shutdown stops the manager gracefully
func (m *Manager) Shutdown() {
	// Stop notification client first
	StopNotificationClient()
	m.cancel()
}

// RegisterClient adds a new client to the manager (exported method)
func (m *Manager) RegisterClient(client *Client) {
	m.register <- client
}

// UnregisterClient removes a client from the manager (exported method)
func (m *Manager) UnregisterClient(client *Client) {
	m.unregister <- client
}

// registerClient adds a new client to the manager
func (m *Manager) registerClient(client *Client) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	// Close existing connection if user reconnects
	if existingClient, exists := m.clients[client.ID]; exists {
		existingClient.Close()
	}
	
	m.clients[client.ID] = client
	log.Printf("Client %s registered. Total clients: %d", client.ID, len(m.clients))
	
	// Send welcome message
	welcome := BroadcastMessage{
		Type: "connection_ack",
		Data: map[string]any{
			"status": "connected",
			"user_id": client.ID,
		},
	}
	
	select {
	case client.Send <- m.messageToBytes(welcome):
	default:
		client.Close()
		delete(m.clients, client.ID)
	}
}

// unregisterClient removes a client from the manager
func (m *Manager) unregisterClient(client *Client) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.unregisterClientUnsafe(client)
}

// unregisterClientUnsafe removes a client without locking (internal use)
func (m *Manager) unregisterClientUnsafe(client *Client) {
	if _, exists := m.clients[client.ID]; exists {
		delete(m.clients, client.ID)
		client.Close()
		
		// Remove from all channels
		for channelName, subscribers := range m.channels {
			delete(subscribers, client.ID)
			if len(subscribers) == 0 {
				delete(m.channels, channelName)
			}
		}
		
		log.Printf("Client %s unregistered. Total clients: %d", client.ID, len(m.clients))
	}
}

// broadcastMessage sends a message to the appropriate clients
func (m *Manager) broadcastMessage(message BroadcastMessage) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	messageBytes := m.messageToBytes(message)
	
	if message.UserID != "" {
		// Send to specific user
		if client, exists := m.clients[message.UserID]; exists {
			select {
			case client.Send <- messageBytes:
			default:
				client.Close()
				delete(m.clients, message.UserID)
			}
		}
	} else if message.Channel != "" {
		// Send to all subscribers of a channel
		if subscribers, exists := m.channels[message.Channel]; exists {
			for userID, client := range subscribers {
				select {
				case client.Send <- messageBytes:
				default:
					client.Close()
					delete(m.clients, userID)
					delete(subscribers, userID)
				}
			}
		}
	} else {
		// Broadcast to all connected clients
		for userID, client := range m.clients {
			select {
			case client.Send <- messageBytes:
			default:
				client.Close()
				delete(m.clients, userID)
			}
		}
	}
}

// SubscribeToChannel subscribes a client to a channel
func (m *Manager) SubscribeToChannel(userID, channel string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	client, exists := m.clients[userID]
	if !exists {
		log.Printf("Cannot subscribe user %s to channel %s: client not found", userID, channel)
		return
	}
	
	// Initialize channel if it doesn't exist
	if _, exists := m.channels[channel]; !exists {
		m.channels[channel] = make(map[string]*Client)
	}
	
	m.channels[channel][userID] = client
	client.Subscribe(channel)
	
	log.Printf("User %s subscribed to channel %s (total subscribers: %d)", 
		userID, channel, len(m.channels[channel]))
}

// UnsubscribeFromChannel unsubscribes a client from a channel
func (m *Manager) UnsubscribeFromChannel(userID, channel string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if subscribers, exists := m.channels[channel]; exists {
		delete(subscribers, userID)
		if len(subscribers) == 0 {
			delete(m.channels, channel)
			log.Printf("Channel %s removed (no subscribers)", channel)
		}
	}
	
	if client, exists := m.clients[userID]; exists {
		client.Unsubscribe(channel)
	}
	
	log.Printf("User %s unsubscribed from channel %s", userID, channel)
}

// SendToUser sends a message to a specific user
func (m *Manager) SendToUser(userID string, messageType string, data any) {
	message := BroadcastMessage{
		Type:   messageType,
		Data:   data,
		UserID: userID,
	}
	
	select {
	case m.broadcast <- message:
	default:
		log.Printf("Broadcast channel full, dropping message to user %s", userID)
	}
}

// SendToChannel sends a message to all subscribers of a channel
func (m *Manager) SendToChannel(channel string, messageType string, data any, fromUser string) {
	message := BroadcastMessage{
		Type:     messageType,
		Data:     data,
		Channel:  channel,
		FromUser: fromUser,
	}
	
	select {
	case m.broadcast <- message:
	default:
		log.Printf("Broadcast channel full, dropping message to channel %s", channel)
	}
}

// messageToBytes converts a message to JSON bytes
func (m *Manager) messageToBytes(message BroadcastMessage) []byte {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return nil
	}
	return data
}

// GetConnectedUsers returns a list of connected user IDs
func (m *Manager) GetConnectedUsers() []string {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	users := make([]string, 0, len(m.clients))
	for userID := range m.clients {
		users = append(users, userID)
	}
	return users
}

