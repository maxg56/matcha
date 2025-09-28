package websocket

import (
	"chat-service/src/logger"
)

// BroadcastToConversation sends a message to all participants in a conversation
func (h *Hub) BroadcastToConversation(conversationID uint, msg OutgoingMessage, excludeUserID uint) {
	h.broadcast <- BroadcastMessage{
		Message:        msg,
		ConversationID: conversationID,
		ExcludeUserID:  excludeUserID,
	}
}

// BroadcastToUser sends a message to a specific user
func (h *Hub) BroadcastToUser(userID uint, msg OutgoingMessage) {
	h.mutex.RLock()
	conn, exists := h.connections[userID]
	h.mutex.RUnlock()

	if exists {
		conn.sendMessage(msg)
	}
}

// BroadcastToUsers sends a message to multiple users
func (h *Hub) BroadcastToUsers(userIDs []uint, message any) error {
	msg, ok := message.(OutgoingMessage)
	if !ok {
		logger.ErrorWithContext(logger.WithComponent("websocket_hub"), "Invalid message type for broadcast")
		return ErrInvalidMessage
	}

	h.mutex.RLock()
	defer h.mutex.RUnlock()

	for _, userID := range userIDs {
		if conn, exists := h.connections[userID]; exists {
			conn.sendMessage(msg)
		}
	}

	return nil
}

// handleBroadcast processes broadcast messages
func (h *Hub) handleBroadcast(broadcastMsg BroadcastMessage) {
	// Get conversation participants
	participants, err := h.getConversationParticipants(broadcastMsg.ConversationID)
	if err != nil {
		logger.ErrorWithContext(logger.WithComponent("websocket_hub").WithConversation(broadcastMsg.ConversationID), "Failed to get participants: %v", err)
		return
	}

	h.mutex.RLock()
	defer h.mutex.RUnlock()

	// Send to all participants except excluded user
	for _, userID := range participants {
		if userID == broadcastMsg.ExcludeUserID {
			continue
		}

		if conn, exists := h.connections[userID]; exists {
			conn.sendMessage(broadcastMsg.Message)
		}
	}
}