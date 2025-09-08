package services

import (
	"chat-service/src/conf"
	"chat-service/src/models"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type MessageService struct{}

func NewMessageService() *MessageService {
	return &MessageService{}
}

type MessageEvent struct {
	Type           string                 `json:"type"`
	ConversationID uint                   `json:"conversation_id"`
	Message        models.Message         `json:"message"`
	Participants   []uint                 `json:"participants"`
	Timestamp      time.Time              `json:"timestamp"`
	Data           map[string]interface{} `json:"data,omitempty"`
}

func (ms *MessageService) PublishMessage(message models.Message, participants []uint) error {
	event := MessageEvent{
		Type:           "new_message",
		ConversationID: message.ConvID,
		Message:        message,
		Participants:   participants,
		Timestamp:      time.Now(),
	}

	eventJSON, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal message event: %w", err)
	}

	channel := fmt.Sprintf("conversation:%d", message.ConvID)
	err = conf.RedisClient.Publish(conf.Ctx, channel, eventJSON).Err()
	if err != nil {
		return fmt.Errorf("failed to publish message: %w", err)
	}

	for _, userID := range participants {
		userChannel := fmt.Sprintf("user:%d", userID)
		err = conf.RedisClient.Publish(conf.Ctx, userChannel, eventJSON).Err()
		if err != nil {
			log.Printf("Failed to publish to user channel %s: %v", userChannel, err)
		}
	}

	return nil
}

func (ms *MessageService) SaveMessage(senderID, conversationID uint, content string) (*models.Message, error) {
	message := models.Message{
		ConvID:   conversationID,
		SenderID: senderID,
		Msg:      content,
		Time:     time.Now(),
	}

	result := conf.DB.Create(&message)
	if result.Error != nil {
		return nil, result.Error
	}

	err := ms.UpdateConversationLastMessage(conversationID, content)
	if err != nil {
		log.Printf("Failed to update conversation last message: %v", err)
	}

	return &message, nil
}

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

	for i := 0; i < len(messages)/2; i++ {
		j := len(messages) - 1 - i
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nil
}

func (ms *MessageService) MarkMessagesAsRead(conversationID, userID uint) error {
	now := time.Now()
	result := conf.DB.Model(&models.Message{}).
		Where("conv_id = ? AND sender_id != ? AND read_at IS NULL", conversationID, userID).
		Update("read_at", now)

	return result.Error
}