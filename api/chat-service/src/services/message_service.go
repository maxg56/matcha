package services

import (
	"chat-service/src/conf"
	"chat-service/src/logger"
	"chat-service/src/models"
	"encoding/json"
	"fmt"
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

type MessageEvent struct {
	Type           string         `json:"type"`
	ConversationID uint           `json:"conversation_id"`
	Message        models.Message `json:"message"`
	Participants   []uint         `json:"participants"`
	Timestamp      time.Time      `json:"timestamp"`
	Data           map[string]any `json:"data,omitempty"`
}

func (ms *MessageService) PublishMessage(message models.Message, participants []uint) error {
	start := time.Now()
	ctx := logger.WithComponent("message_service").
		WithUser(message.SenderID).
		WithConversation(message.ConvID).
		WithMessage(message.ID).
		WithAction("publish_message")

	logger.InfoWithContext(ctx, "Publishing message to %d participants", len(participants))

	event := MessageEvent{
		Type:           "new_message",
		ConversationID: message.ConvID,
		Message:        message,
		Participants:   participants,
		Timestamp:      time.Now(),
	}

	eventJSON, err := json.Marshal(event)
	if err != nil {
		logger.ErrorWithContext(ctx, "Failed to marshal message event: %v", err)
		return fmt.Errorf("failed to marshal message event: %w", err)
	}

	// Publish to conversation channel
	channel := fmt.Sprintf("conversation:%d", message.ConvID)
	err = conf.RedisClient.Publish(conf.Ctx, channel, eventJSON).Err()
	if err != nil {
		logger.ErrorWithContext(ctx, "Failed to publish to conversation channel: %v", err)
		return fmt.Errorf("failed to publish message: %w", err)
	}

	// Publish to individual user channels
	publishedCount := 0
	for _, userID := range participants {
		userChannel := fmt.Sprintf("user:%d", userID)
		err = conf.RedisClient.Publish(conf.Ctx, userChannel, eventJSON).Err()
		if err != nil {
			logger.ErrorWithContext(ctx.WithUser(userID), "Failed to publish to user channel %s: %v", userChannel, err)
		} else {
			publishedCount++
		}
	}

	logger.InfoWithContext(ctx.WithExtra("published_to_users", publishedCount),
		"Message published to %d/%d user channels", publishedCount, len(participants))

	// Send push notifications
	err = ms.sendMessageNotification(message, participants)
	if err != nil {
		logger.WarnWithContext(ctx, "Failed to send message notification: %v", err)
		// Ne pas faire échouer la publication du message si les notifications échouent
	}

	duration := time.Since(start)
	logger.InfoWithContext(ctx.WithDuration(duration), "Message publication completed")

	return nil
}

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

func (ms *MessageService) sendMessageNotification(message models.Message, participants []uint) error {
	ctx := logger.WithComponent("message_service").
		WithUser(message.SenderID).
		WithConversation(message.ConvID).
		WithMessage(message.ID).
		WithAction("send_notification")

	recipientCount := 0
	for _, userID := range participants {
		if userID != message.SenderID {
			recipientCount++
		}
	}

	logger.InfoWithContext(ctx, "Sending message notifications to %d recipients", recipientCount)

	successCount := 0
	// Envoyer une notification à tous les participants sauf l'expéditeur
	for _, userID := range participants {
		if userID == message.SenderID {
			continue // Ne pas notifier l'expéditeur
		}

		userCtx := ctx.WithUser(userID)

		notification := map[string]any{
			"to_user_id":  userID,
			"notif_type":  "3", // Type 3 = message selon notification_types.py
			"message":     "Vous avez reçu un nouveau message",
		}

		notificationJSON, err := json.Marshal(notification)
		if err != nil {
			logger.ErrorWithContext(userCtx, "Failed to marshal notification: %v", err)
			continue
		}

		// Publier directement sur le canal Redis du service de notification
		// C'est exactement ce que fait l'API /notifications/send en interne
		err = conf.RedisClient.Publish(conf.Ctx, "notifications", notificationJSON).Err()
		if err != nil {
			logger.ErrorWithContext(userCtx, "Failed to publish notification: %v", err)
			continue
		}

		successCount++
		logger.DebugWithContext(userCtx, "📨 Message notification sent successfully")
	}

	logger.InfoWithContext(ctx.WithExtra("success_count", successCount),
		"Message notifications sent: %d/%d successful", successCount, recipientCount)

	return nil
}