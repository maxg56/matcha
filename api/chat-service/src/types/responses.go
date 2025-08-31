package types

import (
	"chat-service/src/models"
	"time"
)

// ConversationResponse represents a conversation with additional info
type ConversationResponse struct {
	ID                 uint                `json:"id"`
	User1ID            uint                `json:"user1_id"`
	User2ID            uint                `json:"user2_id"`
	LastMessage        string              `json:"last_message"`
	LastMessageAt      *time.Time          `json:"last_message_at"`
	UnreadCount        int64               `json:"unread_count"`
	OtherUser          *UserInfo           `json:"other_user"`
	CreatedAt          time.Time           `json:"created_at"`
}

// MessageResponse represents a message with sender info
type MessageResponse struct {
	ID           uint      `json:"id"`
	ConvID       uint      `json:"conv_id"`
	SenderID     uint      `json:"sender_id"`
	Message      string    `json:"message"`
	Time         time.Time `json:"time"`
	ReadAt       *time.Time `json:"read_at"`
	SenderInfo   *UserInfo `json:"sender_info,omitempty"`
}

// UserInfo represents basic user information
type UserInfo struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Avatar   string `json:"avatar,omitempty"`
}

// MessagesResponse represents paginated messages
type MessagesResponse struct {
	Messages []MessageResponse `json:"messages"`
	HasMore  bool              `json:"has_more"`
	Total    int64             `json:"total"`
}

// ConversationListResponse represents paginated conversations
type ConversationListResponse struct {
	Conversations []ConversationResponse `json:"conversations"`
	HasMore       bool                   `json:"has_more"`
	Total         int64                  `json:"total"`
}

// SuccessResponse represents a simple success message
type SuccessResponse struct {
	Message string `json:"message"`
	Success bool   `json:"success"`
}

// ConversationCreatedResponse represents response after creating conversation
type ConversationCreatedResponse struct {
	Conversation *models.Discussion `json:"conversation"`
	IsNew        bool               `json:"is_new"`
	Message      string             `json:"message"`
}

// MessageSentResponse represents response after sending message
type MessageSentResponse struct {
	Message     *models.Message `json:"message"`
	Delivered   bool            `json:"delivered"`
	Recipients  []uint          `json:"recipients"`
}