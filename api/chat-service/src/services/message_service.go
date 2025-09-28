package services

import (
	"chat-service/src/conf"
	"chat-service/src/logger"
	"chat-service/src/models"
	"time"
)

type MessageService struct{}

func NewMessageService() *MessageService {
	return &MessageService{}
}

// Helper function for min
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// SaveMessage saves a new message to the database
func (ms *MessageService) SaveMessage(senderID, conversationID uint, content string) (*models.Message, error) {
	ctx := logger.WithComponent("message_service").
		WithUser(senderID).
		WithConversation(conversationID).
		WithAction("save_message")

	logger.DebugWithContext(ctx, "Saving message: %s", content[:min(50, len(content))])

	message := models.Message{
		ConvID:   conversationID,
		SenderID: senderID,
		Msg:      content,
		Time:     time.Now(),
	}

	result := conf.DB.Create(&message)
	if result.Error != nil {
		logger.ErrorWithContext(ctx, "Failed to save message to database: %v", result.Error)
		return nil, result.Error
	}

	logger.InfoWithContext(ctx.WithMessage(message.ID), "Message saved successfully")

	err := ms.UpdateConversationLastMessage(conversationID, content)
	if err != nil {
		logger.WarnWithContext(ctx, "Failed to update conversation last message: %v", err)
	}

	return &message, nil
}

// UpdateConversationLastMessage updates the conversation's last message info
func (ms *MessageService) UpdateConversationLastMessage(conversationID uint, content string) error {
	now := time.Now()
	result := conf.DB.Model(&models.Discussion{}).
		Where("id = ?", conversationID).
		Updates(models.Discussion{
			LastMessageContent: content,
			LastMessageAt:      &now,
		})

	return result.Error
}

// GetMessages retrieves messages from a conversation with pagination
func (ms *MessageService) GetMessages(conversationID uint, limit int, offset int) ([]models.Message, error) {
	var messages []models.Message

	query := conf.DB.Where("conv_id = ?", conversationID).
		Order("time DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	if offset > 0 {
		query = query.Offset(offset)
	}

	result := query.Find(&messages)
	if result.Error != nil {
		return nil, result.Error
	}

	// Reverse the order to get chronological order
	for i := 0; i < len(messages)/2; i++ {
		j := len(messages) - 1 - i
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nil
}

// MarkMessagesAsRead marks messages as read for a specific user in a conversation
func (ms *MessageService) MarkMessagesAsRead(conversationID, userID uint) error {
	now := time.Now()
	result := conf.DB.Model(&models.Message{}).
		Where("conv_id = ? AND sender_id != ? AND read_at IS NULL", conversationID, userID).
		Update("read_at", now)

	return result.Error
}