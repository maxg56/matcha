package types

// ConversationRequest represents request to create a conversation
type ConversationRequest struct {
	UserID uint `json:"user_id" binding:"required,min=1"`
}

// MessageRequest represents request to send a message
type MessageRequest struct {
	ConversationID uint   `json:"conversation_id" binding:"required,min=1"`
	Message        string `json:"message" binding:"required,min=1,max=1000"`
}

// PaginationRequest represents pagination parameters
type PaginationRequest struct {
	Limit  int `form:"limit" binding:"omitempty,min=1,max=100"`
	Offset int `form:"offset" binding:"omitempty,min=0"`
}

// ConversationParams represents conversation URL parameters
type ConversationParams struct {
	ConversationID uint `uri:"conversationID" binding:"required,min=1"`
}

// WebSocketAuthRequest represents WebSocket authentication
type WebSocketAuthRequest struct {
	Token  string `json:"token" binding:"required"`
	UserID uint   `json:"user_id" binding:"required,min=1"`
}

// TypingRequest represents typing notification
type TypingRequest struct {
	ConversationID uint `json:"conversation_id" binding:"required,min=1"`
	IsTyping       bool `json:"is_typing"`
}