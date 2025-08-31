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
	
	err := mp.connMgr.BroadcastToUsers(recipients, wsMessage)
	if err != nil {
		log.Printf("Failed to broadcast message %d: %v", message.ID, err)
		return err
	}
	
	log.Printf("Message %d broadcasted to %d recipients", message.ID, len(recipients))
	return nil
}

func (mp *messagePublisher) NotifyOnline(userIDs []uint, message any) error {
	wsMessage := types.WebSocketMessage{
		Type: types.MessageTypeOnline,
		Data: message,
	}
	
	return mp.connMgr.BroadcastToUsers(userIDs, wsMessage)
}

// NotifyTyping sends typing notification
func (mp *messagePublisher) NotifyTyping(conversationID, senderID uint, participants []uint, isTyping bool) error {
	wsMessage := types.WebSocketMessage{
		Type: types.MessageTypeTyping,
		Data: map[string]any{
			"conversation_id": conversationID,
			"sender_id":       senderID,
			"is_typing":       isTyping,
		},
	}
	
	// Send to all participants except sender
	var recipients []uint
	for _, participantID := range participants {
		if participantID != senderID {
			recipients = append(recipients, participantID)
		}
	}
	
	return mp.connMgr.BroadcastToUsers(recipients, wsMessage)
}

// NotifyMessageRead sends read notification
func (mp *messagePublisher) NotifyMessageRead(conversationID, readerID uint, participants []uint) error {
	wsMessage := types.WebSocketMessage{
		Type: types.MessageTypeRead,
		Data: map[string]any{
			"conversation_id": conversationID,
			"reader_id":       readerID,
		},
	}
	
	// Send to all participants except reader
	var recipients []uint
	for _, participantID := range participants {
		if participantID != readerID {
			recipients = append(recipients, participantID)
		}
	}
	
	return mp.connMgr.BroadcastToUsers(recipients, wsMessage)
}