package websocket

import (
	"chat-service/src/logger"
	"chat-service/src/types"
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

	// Repository for direct data access (needed for system operations)
	repository types.ChatRepository
}

// BroadcastMessage represents a message to broadcast
type BroadcastMessage struct {
	Message        OutgoingMessage
	ConversationID uint
	ExcludeUserID  uint
}

// NewHub creates a new WebSocket hub
func NewHub(chatService types.ChatService, repository types.ChatRepository) *Hub {
	return &Hub{
		connections: make(map[uint]*Connection),
		register:    make(chan *Connection),
		unregister:  make(chan *Connection),
		broadcast:   make(chan BroadcastMessage),
		chatService: chatService,
		repository:  repository,
	}
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	logger.InfoWithContext(logger.WithComponent("websocket_hub"), "🔌 WebSocket Hub started")

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
		logger.WarnWithContext(logger.WithComponent("websocket_hub").WithUser(conn.userID), "Replaced existing connection")
	}

	h.connections[conn.userID] = conn
	logger.InfoWithContext(logger.WithComponent("websocket_hub").WithUser(conn.userID), "User connected, total: %d", len(h.connections))

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
		logger.InfoWithContext(logger.WithComponent("websocket_hub").WithUser(conn.userID), "User disconnected, total: %d", len(h.connections))

		// Notify other users (if needed)
		h.notifyUserStatus(conn.userID, "offline")
	}
}

// notifyUserStatus notifies about user online/offline status
func (h *Hub) notifyUserStatus(userID uint, status string) {
	// This could be used to notify friends/contacts about user status
	// Implementation depends on requirements
	logger.DebugWithContext(logger.WithComponent("websocket_hub").WithUser(userID), "User is now %s", status)
}

// GetChatService returns the chat service instance
func (h *Hub) GetChatService() types.ChatService {
	return h.chatService
}

// SetChatService sets the chat service (used for dependency injection)
func (h *Hub) SetChatService(chatService types.ChatService) {
	h.chatService = chatService
}

// getConversationParticipants gets participants for a conversation
func (h *Hub) getConversationParticipants(conversationID uint) ([]uint, error) {
	if h.repository == nil {
		logger.WarnWithContext(logger.WithComponent("websocket_hub"), "No repository available for getting conversation participants")
		return []uint{}, nil
	}

	return h.repository.GetConversationParticipants(conversationID)
}

// Implement types.ConnectionManager interface
func (h *Hub) AddConnection(userID uint, conn types.WebSocketConnection) error {
	// This is a compatibility method for the interface
	// In practice, connections should be added through RegisterConnection
	logger.DebugWithContext(logger.WithComponent("websocket_hub").WithUser(userID), "AddConnection called")
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