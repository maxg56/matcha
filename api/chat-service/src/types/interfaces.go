package types

import (
	"chat-service/src/models"
	"context"
)

// ChatRepository defines database operations interface
type ChatRepository interface {
	// Conversation operations
	GetUserConversations(userID uint) ([]models.Discussion, error)
	GetConversation(conversationID uint) (*models.Discussion, error)
	CreateConversation(user1ID, user2ID uint) (*models.Discussion, error)
	FindConversationBetweenUsers(user1ID, user2ID uint) (*models.Discussion, error)
	IsUserInConversation(userID, conversationID uint) (bool, error)
	GetConversationParticipants(conversationID uint) ([]uint, error)
	UpdateLastMessage(conversationID uint, content string) error

	// Message operations
	GetMessages(conversationID uint, limit, offset int) ([]models.Message, error)
	SaveMessage(senderID, conversationID uint, content string) (*models.Message, error)
	MarkMessagesAsRead(conversationID, userID uint) error
	GetUnreadCount(conversationID, userID uint) (int64, error)
}

// MessagePublisher handles message broadcasting
type MessagePublisher interface {
	PublishMessage(message models.Message, participants []uint) error
	NotifyOnline(userIDs []uint, message interface{}) error
}

// ConnectionManager manages WebSocket connections
type ConnectionManager interface {
	AddConnection(userID uint, conn WebSocketConnection) error
	RemoveConnection(userID uint) error
	GetConnection(userID uint) (WebSocketConnection, bool)
	BroadcastToUsers(userIDs []uint, message interface{}) error
	IsUserOnline(userID uint) bool
}

// WebSocketConnection represents a WebSocket connection
type WebSocketConnection interface {
	WriteMessage(messageType int, data []byte) error
	ReadMessage() (messageType int, data []byte, err error)
	Close() error
	SetReadDeadline(deadline interface{}) error
	SetWriteDeadline(deadline interface{}) error
}

// AuthService validates user authentication
type AuthService interface {
	ValidateToken(token string) (*TokenClaims, error)
	GetUserFromContext(ctx context.Context) (uint, error)
}

// NotificationService sends notifications
type NotificationService interface {
	SendMessageNotification(recipientID uint, message models.Message) error
	SendTypingNotification(conversationID uint, senderID uint, isTyping bool) error
}

// ChatService combines all chat operations
type ChatService interface {
	// Conversation methods
	GetUserConversations(userID uint) ([]models.Discussion, error)
	GetConversation(userID, conversationID uint) (*models.Discussion, error)
	CreateConversation(user1ID, user2ID uint) (*models.Discussion, error)
	
	// Message methods
	GetMessages(userID, conversationID uint, limit, offset int) ([]models.Message, error)
	SendMessage(senderID, conversationID uint, content string) (*models.Message, error)
	MarkMessagesAsRead(userID, conversationID uint) error
	
	// Real-time methods
	HandleConnection(userID uint, conn WebSocketConnection) error
	BroadcastMessage(message models.Message) error
}

// TokenClaims represents JWT token claims
type TokenClaims struct {
	UserID uint   `json:"user_id"`
	Exp    int64  `json:"exp"`
}

// WebSocketMessage represents a WebSocket message
type WebSocketMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

// MessageType constants
const (
	MessageTypeChat   = "chat"
	MessageTypeTyping = "typing"
	MessageTypeRead   = "read"
	MessageTypeError  = "error"
	MessageTypeOnline = "online"
)