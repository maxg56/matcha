package services

import (
	"chat-service/src/conf"
	"chat-service/src/logger"
	"chat-service/src/models"
	"encoding/json"
	"fmt"
	"time"
)

// NotificationService handles message publishing and notifications
type NotificationService struct{}

func NewNotificationService() *NotificationService {
	return &NotificationService{}
}

// MessageEvent represents a message event for publishing
type MessageEvent struct {
	Type           string         `json:"type"`
	ConversationID uint           `json:"conversation_id"`
	Message        models.Message `json:"message"`
	Timestamp      time.Time      `json:"timestamp"`
	Data           map[string]any `json:"data,omitempty"`
}

// PublishMessage publishes a message to Redis channels and sends notifications
func (ns *NotificationService) PublishMessage(message models.Message, participants []uint) error {
	start := time.Now()
	ctx := logger.WithComponent("notification_service").
		WithUser(message.SenderID).
		WithConversation(message.ConvID).
		WithMessage(message.ID).
		WithAction("publish_message")

	logger.InfoWithContext(ctx, "Publishing message to %d participants", len(participants))

	event := MessageEvent{
		Type:           "new_message",
		ConversationID: message.ConvID,
		Message:        message,
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
	err = ns.sendMessageNotification(message, participants)
	if err != nil {
		logger.WarnWithContext(ctx, "Failed to send message notification: %v", err)
		// Ne pas faire échouer la publication du message si les notifications échouent
	}

	duration := time.Since(start)
	logger.InfoWithContext(ctx.WithDuration(duration), "Message publication completed")

	return nil
}

// sendMessageNotification sends push notifications for the message
func (ns *NotificationService) sendMessageNotification(message models.Message, participants []uint) error {
	ctx := logger.WithComponent("notification_service").
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
			"to_user_id": userID,
			"notif_type": "3", // Type 3 = message selon notification_types.py
			"message":    "Vous avez reçu un nouveau message",
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