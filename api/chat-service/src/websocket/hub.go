package websocket

import (
	"chat-service/src/logger"
	"chat-service/src/types"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/websocket"
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

// handleBroadcast processes broadcast messages
func (h *Hub) handleBroadcast(broadcastMsg BroadcastMessage) {
	// Get conversation participants
	participants, err := h.getConversationParticipants(broadcastMsg.ConversationID)
	if err != nil {
		logger.ErrorWithContext(logger.WithComponent("websocket_hub").WithConversation(broadcastMsg.ConversationID), "Failed to get participants: %v", err)
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
func (h *Hub) getConversationParticipants(conversationID uint) ([]uint, error) {
	if h.repository == nil {
		logger.WarnWithContext(logger.WithComponent("websocket_hub"), "No repository available for getting conversation participants")
		return []uint{}, nil
	}
	
	return h.repository.GetConversationParticipants(conversationID)
}

// notifyUserStatus notifies about user online/offline status
func (h *Hub) notifyUserStatus(userID uint, status string) {
	// This could be used to notify friends/contacts about user status
	// Implementation depends on requirements
	logger.DebugWithContext(logger.WithComponent("websocket_hub").WithUser(userID), "User is now %s", status)
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

func (h *Hub) BroadcastToUsers(userIDs []uint, message any) error {
	msg, ok := message.(OutgoingMessage)
	if !ok {
		logger.ErrorWithContext(logger.WithComponent("websocket_hub"), "Invalid message type for broadcast")
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

// SetChatService sets the chat service (used for dependency injection)
func (h *Hub) SetChatService(chatService types.ChatService) {
	h.chatService = chatService
}

// GatewayMessage represents messages from Gateway
type GatewayMessage struct {
	Type           string                 `json:"type"`
	UserID         string                 `json:"user_id"`
	ConversationID string                 `json:"conversation_id"`
	Content        string                 `json:"content,omitempty"`
	Token          string                 `json:"token,omitempty"`
	RequestID      string                 `json:"request_id,omitempty"`
	Data           map[string]interface{} `json:"data,omitempty"`
}

// GatewayResponse represents responses to Gateway
type GatewayResponse struct {
	Type           string                 `json:"type"`
	RequestID      string                 `json:"request_id,omitempty"`
	Status         string                 `json:"status,omitempty"`
	Message        string                 `json:"message,omitempty"`
	ConversationID string                 `json:"conversation_id,omitempty"`
	UserID         string                 `json:"user_id,omitempty"`
	Data           map[string]interface{} `json:"data,omitempty"`
	Error          string                 `json:"error,omitempty"`
}

// HandleGatewayConnection handles WebSocket connection from Gateway
func (h *Hub) HandleGatewayConnection(conn *websocket.Conn) {
	logger.InfoWithContext(logger.WithComponent("websocket_hub").WithAction("gateway_connection"), "Gateway WebSocket connection established")

	defer func() {
		conn.Close()
		logger.InfoWithContext(logger.WithComponent("websocket_hub").WithAction("gateway_disconnection"), "Gateway WebSocket connection closed")
	}()

	// Set read deadline for ping/pong
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	// Listen for messages from Gateway
	for {
		var gatewayMsg GatewayMessage
		err := conn.ReadJSON(&gatewayMsg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logger.ErrorWithContext(logger.WithComponent("websocket_hub").WithAction("gateway_read_error"), "Gateway WebSocket read error: %v", err)
			}
			break
		}

		// Handle the message from Gateway
		h.handleGatewayMessage(gatewayMsg, conn)
	}
}

// handleGatewayMessage processes messages from Gateway
func (h *Hub) handleGatewayMessage(msg GatewayMessage, conn *websocket.Conn) {
	logger.DebugWithContext(
		logger.WithComponent("websocket_hub").WithAction("gateway_message"),
		"Received from Gateway: type=%s, user=%s", msg.Type, msg.UserID,
	)

	switch msg.Type {
	case "chat_message":
		h.handleGatewayChatMessage(msg, conn)
	case "join_conversation":
		h.handleGatewayJoinConversation(msg, conn)
	case "typing":
		h.handleGatewayTyping(msg, conn)
	default:
		logger.WarnWithContext(
			logger.WithComponent("websocket_hub").WithAction("unknown_gateway_message"),
			"Unknown message type from Gateway: %s", msg.Type,
		)
	}
}

// handleGatewayChatMessage handles chat messages from Gateway
func (h *Hub) handleGatewayChatMessage(msg GatewayMessage, conn *websocket.Conn) {
	// Parse user and conversation IDs
	userID := parseUintFromString(msg.UserID)
	conversationID := parseUintFromString(msg.ConversationID)

	if userID == 0 || conversationID == 0 || msg.Content == "" {
		h.sendErrorToGateway(conn, msg.RequestID, "Invalid message parameters")
		return
	}

	// Send message through chat service
	message, err := h.chatService.SendMessage(userID, conversationID, msg.Content)
	if err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub").WithUser(userID).WithConversation(conversationID),
			"Failed to send message via Gateway: %v", err,
		)
		h.sendErrorToGateway(conn, msg.RequestID, err.Error())
		return
	}

	// Send the message back to Gateway for broadcasting to users
	broadcastResponse := GatewayResponse{
		Type:           "chat_message",
		ConversationID: msg.ConversationID,
		UserID:         msg.UserID,
		Message:        message.Msg,
		Data: map[string]interface{}{
			"message_id":   message.ID,
			"sender_id":    message.SenderID,
			"message":      message.Msg,
			"timestamp":    message.Time.Unix(),
			"read_at":      message.ReadAt,
		},
	}

	if err := conn.WriteJSON(broadcastResponse); err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub"),
			"Failed to send broadcast message to Gateway: %v", err,
		)
	}

	// Send acknowledgment to Gateway
	ackResponse := GatewayResponse{
		Type:           "chat_ack",
		RequestID:      msg.RequestID,
		Status:         "success",
		ConversationID: msg.ConversationID,
		UserID:         msg.UserID,
		Data: map[string]interface{}{
			"message_id": message.ID,
			"timestamp":  message.Time.Unix(),
		},
	}

	if err := conn.WriteJSON(ackResponse); err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub"),
			"Failed to send ack to Gateway: %v", err,
		)
	}

	logger.InfoWithContext(
		logger.WithComponent("websocket_hub").WithUser(userID).WithConversation(conversationID),
		"Message relayed from Gateway successfully",
	)
}

// handleGatewayJoinConversation handles join requests from Gateway
func (h *Hub) handleGatewayJoinConversation(msg GatewayMessage, conn *websocket.Conn) {
	userID := parseUintFromString(msg.UserID)
	conversationID := parseUintFromString(msg.ConversationID)

	if userID == 0 || conversationID == 0 {
		h.sendErrorToGateway(conn, msg.RequestID, "Invalid join parameters")
		return
	}

	err := h.chatService.MarkMessagesAsRead(userID, conversationID)
	if err != nil {
		h.sendErrorToGateway(conn, msg.RequestID, err.Error())
		return
	}

	// Send success response
	response := GatewayResponse{
		Type:           "response",
		RequestID:      msg.RequestID,
		Status:         "success",
		ConversationID: msg.ConversationID,
		UserID:         msg.UserID,
	}

	if err := conn.WriteJSON(response); err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub"),
			"Failed to send join response to Gateway: %v", err,
		)
	}
}

// handleGatewayTyping handles typing notifications from Gateway
func (h *Hub) handleGatewayTyping(msg GatewayMessage, conn *websocket.Conn) {
	userID := parseUintFromString(msg.UserID)
	conversationID := parseUintFromString(msg.ConversationID)

	if userID == 0 || conversationID == 0 {
		return
	}

	isTyping := false
	if msg.Data != nil {
		if typing, ok := msg.Data["is_typing"].(bool); ok {
			isTyping = typing
		}
	}

	// Broadcast typing notification to other users in conversation
	typingMsg := OutgoingMessage{
		Type:           MessageTypeTyping,
		ConversationID: conversationID,
		Data: TypingData{
			UserID:   userID,
			IsTyping: isTyping,
		},
		Timestamp: time.Now(),
	}

	h.BroadcastToConversation(conversationID, typingMsg, userID)
}

// sendErrorToGateway sends error response to Gateway
func (h *Hub) sendErrorToGateway(conn *websocket.Conn, requestID, errorMsg string) {
	response := GatewayResponse{
		Type:      "response",
		RequestID: requestID,
		Status:    "error",
		Error:     errorMsg,
	}

	if err := conn.WriteJSON(response); err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub"),
			"Failed to send error to Gateway: %v", err,
		)
	}
}

// parseUintFromString safely parses a string to uint
func parseUintFromString(s string) uint {
	if s == "" {
		return 0
	}

	val, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		logger.WarnWithContext(logger.WithComponent("websocket_hub"), "Failed to parse uint from string: %s", s)
		return 0
	}

	return uint(val)
}