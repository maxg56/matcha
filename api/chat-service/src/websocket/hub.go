package websocket

import (
	"chat-service/src/types"
	"log"
	"sync"
)

// Hub manages WebSocket connections
type Hub struct {
	// Registered connections
	connections map[uint]*Connection
	
	// Channel for registering connections
	register chan *Connection
	
	// Channel for unregistering connections
	unregister chan *Connection
	
	// Channel for broadcasting messages
	broadcast chan BroadcastMessage
	
	// Mutex for thread-safe operations
	mutex sync.RWMutex
	
	// Chat service for business logic
	chatService types.ChatService
}

// BroadcastMessage represents a message to broadcast
type BroadcastMessage struct {
	Message        OutgoingMessage
	ConversationID uint
	ExcludeUserID  uint
}

// NewHub creates a new WebSocket hub
func NewHub(chatService types.ChatService) *Hub {
	return &Hub{
		connections: make(map[uint]*Connection),
		register:    make(chan *Connection),
		unregister:  make(chan *Connection),
		broadcast:   make(chan BroadcastMessage),
		chatService: chatService,
	}
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	log.Println("🔌 WebSocket Hub started")
	
	for {
		select {
		case conn := <-h.register:
			h.registerConnection(conn)
			
		case conn := <-h.unregister:
			h.unregisterConnection(conn)
			
		case broadcastMsg := <-h.broadcast:
			h.handleBroadcast(broadcastMsg)
		}
	}
}

// RegisterConnection adds a new connection
func (h *Hub) RegisterConnection(conn *Connection) {
	h.register <- conn
}

// UnregisterConnection removes a connection
func (h *Hub) UnregisterConnection(conn *Connection) {
	h.unregister <- conn
}

// BroadcastToConversation sends a message to all participants in a conversation
func (h *Hub) BroadcastToConversation(conversationID uint, msg OutgoingMessage, excludeUserID uint) {
	h.broadcast <- BroadcastMessage{
		Message:        msg,
		ConversationID: conversationID,
		ExcludeUserID:  excludeUserID,
	}
}

// BroadcastToUser sends a message to a specific user
func (h *Hub) BroadcastToUser(userID uint, msg OutgoingMessage) {
	h.mutex.RLock()
	conn, exists := h.connections[userID]
	h.mutex.RUnlock()
	
	if exists {
		conn.sendMessage(msg)
	}
}

// IsUserOnline checks if a user is connected
func (h *Hub) IsUserOnline(userID uint) bool {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	_, exists := h.connections[userID]
	return exists
}

// GetConnectedUsers returns list of connected user IDs
func (h *Hub) GetConnectedUsers() []uint {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	users := make([]uint, 0, len(h.connections))
	for userID := range h.connections {
		users = append(users, userID)
	}
	return users
}

// registerConnection handles connection registration
func (h *Hub) registerConnection(conn *Connection) {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	
	// Close existing connection if any
	if existing, exists := h.connections[conn.userID]; exists {
		existing.Close()
		log.Printf("Replaced existing connection for user %d", conn.userID)
	}
	
	h.connections[conn.userID] = conn
	log.Printf("User %d connected, total: %d", conn.userID, len(h.connections))
	
	// Send connected confirmation
	conn.sendMessage(OutgoingMessage{
		Type: MessageTypeConnected,
		Data: ConnectionData{
			UserID: conn.userID,
			Status: "connected",
		},
	})
	
	// Notify other users (if needed)
	h.notifyUserStatus(conn.userID, "online")
}

// unregisterConnection handles connection unregistration
func (h *Hub) unregisterConnection(conn *Connection) {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	
	if _, exists := h.connections[conn.userID]; exists {
		delete(h.connections, conn.userID)
		conn.Close()
		log.Printf("User %d disconnected, total: %d", conn.userID, len(h.connections))
		
		// Notify other users (if needed)
		h.notifyUserStatus(conn.userID, "offline")
	}
}

// handleBroadcast processes broadcast messages
func (h *Hub) handleBroadcast(broadcastMsg BroadcastMessage) {
	// Get conversation participants
	participants, err := h.getConversationParticipants(broadcastMsg.ConversationID)
	if err != nil {
		log.Printf("Failed to get participants for conversation %d: %v", broadcastMsg.ConversationID, err)
		return
	}
	
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	// Send to all participants except excluded user
	for _, userID := range participants {
		if userID == broadcastMsg.ExcludeUserID {
			continue
		}
		
		if conn, exists := h.connections[userID]; exists {
			conn.sendMessage(broadcastMsg.Message)
		}
	}
}

// getConversationParticipants gets participants for a conversation
func (h *Hub) getConversationParticipants(_ uint) ([]uint, error) {
	// This would typically use the chat service or repository
	// For now, we'll implement a simple version
	// TODO: Implement proper participant lookup
	return []uint{}, nil
}

// notifyUserStatus notifies about user online/offline status
func (h *Hub) notifyUserStatus(userID uint, status string) {
	// This could be used to notify friends/contacts about user status
	// Implementation depends on requirements
	log.Printf("User %d is now %s", userID, status)
}

// Implement types.ConnectionManager interface
func (h *Hub) AddConnection(userID uint, conn types.WebSocketConnection) error {
	// This is a compatibility method for the interface
	// In practice, connections should be added through RegisterConnection
	log.Printf("AddConnection called for user %d", userID)
	return nil
}

func (h *Hub) RemoveConnection(userID uint) error {
	h.mutex.Lock()
	defer h.mutex.Unlock()
	
	if conn, exists := h.connections[userID]; exists {
		h.unregister <- conn
	}
	return nil
}

func (h *Hub) GetConnection(userID uint) (types.WebSocketConnection, bool) {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	conn, exists := h.connections[userID]
	return conn, exists
}

func (h *Hub) BroadcastToUsers(userIDs []uint, message any) error {
	msg, ok := message.(OutgoingMessage)
	if !ok {
		log.Printf("Invalid message type for broadcast")
		return ErrInvalidMessage
	}
	
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	for _, userID := range userIDs {
		if conn, exists := h.connections[userID]; exists {
			conn.sendMessage(msg)
		}
	}
	
	return nil
}

// GetChatService returns the chat service instance
func (h *Hub) GetChatService() types.ChatService {
	return h.chatService
}