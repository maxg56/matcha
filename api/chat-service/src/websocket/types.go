package websocket

import (
	"time"
)

// MessageType defines WebSocket message types
type MessageType string

const (
	MessageTypeSend         MessageType = "send_message"
	MessageTypeJoin         MessageType = "join_conversation"
	MessageTypeTyping       MessageType = "typing"
	MessageTypeNewMessage   MessageType = "new_message"
	MessageTypeError        MessageType = "error"
	MessageTypeConnected    MessageType = "connected"
	MessageTypeDisconnected MessageType = "disconnected"
)

// WSMessage represents a WebSocket message
type WSMessage struct {
	Type           MessageType `json:"type"`
	ConversationID uint        `json:"conversation_id,omitempty"`
	Content        string      `json:"content,omitempty"`
	Data           any         `json:"data,omitempty"`
}

// IncomingMessage represents messages received from clients
type IncomingMessage struct {
	Type           MessageType `json:"type" binding:"required"`
	ConversationID uint        `json:"conversation_id,omitempty"`
	Content        string      `json:"content,omitempty"`
	IsTyping       bool        `json:"is_typing,omitempty"`
}

// OutgoingMessage represents messages sent to clients
type OutgoingMessage struct {
	Type           MessageType `json:"type"`
	ConversationID uint        `json:"conversation_id,omitempty"`
	Data           any         `json:"data,omitempty"`
	Timestamp      time.Time   `json:"timestamp"`
}

// MessageData represents the data payload for new messages
type MessageData struct {
	ID        uint      `json:"id"`
	SenderID  uint      `json:"sender_id"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
	ReadAt    *time.Time `json:"read_at"`
}

// TypingData represents typing notification data
type TypingData struct {
	UserID    uint `json:"user_id"`
	IsTyping  bool `json:"is_typing"`
}

// ErrorData represents error message data
type ErrorData struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// ConnectionData represents connection status data
type ConnectionData struct {
	UserID    uint   `json:"user_id"`
	Status    string `json:"status"`
	Timestamp time.Time `json:"timestamp"`
}