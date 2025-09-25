package messaging

import (
	"chat-service/src/models"
	"chat-service/src/types"
	"log"
)

type messagePublisher struct {
	connMgr types.ConnectionManager
}

func NewMessagePublisher(connMgr types.ConnectionManager) types.MessagePublisher {
	return &messagePublisher{
		connMgr: connMgr,
	}
}

func (mp *messagePublisher) PublishMessage(message models.Message, participants []uint) error {
	wsMessage := types.WebSocketMessage{
		Type: types.MessageTypeChat,
		Data: map[string]any{
			"id":              message.ID,
			"conversation_id": message.ConvID,
			"sender_id":       message.SenderID,
			"message":         message.Msg,
			"time":            message.Time,
			"read_at":         message.ReadAt,
		},
	}
	
	// Send to all participants except sender
	var recipients []uint
	for _, participantID := range participants {
		if participantID != message.SenderID {
			recipients = append(recipients, participantID)
		}
	}
	
	if len(recipients) == 0 {
		return nil
	}
	
	// Note: Broadcasting is now handled by Gateway WebSocket relay
	// Local broadcasting is disabled in favor of Gateway pass-through architecture
	log.Printf("Message %d will be broadcasted to %d recipients via Gateway", message.ID, len(recipients))
	return nil
}

func (mp *messagePublisher) NotifyOnline(userIDs []uint, message any) error {
	// Note: Online notifications are now handled by Gateway WebSocket relay
	log.Printf("Online notification will be sent to %d users via Gateway", len(userIDs))
	return nil
}

// NotifyTyping sends typing notification
func (mp *messagePublisher) NotifyTyping(conversationID, senderID uint, participants []uint, isTyping bool) error {
	// Note: Typing notifications are now handled by Gateway WebSocket relay
	log.Printf("Typing notification (isTyping=%v) will be sent via Gateway for conversation %d", isTyping, conversationID)
	return nil
}

// NotifyMessageRead sends read notification
func (mp *messagePublisher) NotifyMessageRead(conversationID, readerID uint, participants []uint) error {
	// Note: Read notifications are now handled by Gateway WebSocket relay
	log.Printf("Read notification will be sent via Gateway for conversation %d", conversationID)
	return nil
}