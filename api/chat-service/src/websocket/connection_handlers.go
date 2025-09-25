package websocket

import (
	"chat-service/src/logger"
	"chat-service/src/types"
	"time"
)

// handleMessage processes incoming messages
func (c *Connection) handleMessage(msg IncomingMessage, chatService types.ChatService) error {
	// Check rate limiting for send messages
	if msg.Type == MessageTypeSend {
		if !c.checkRateLimit() {
			return ErrRateLimited
		}
	}

	switch msg.Type {
	case MessageTypeSend:
		return c.handleSendMessage(msg, chatService)
	case MessageTypeJoin:
		return c.handleJoinConversation(msg, chatService)
	case MessageTypeTyping:
		return c.handleTyping(msg)
	default:
		return ErrUnknownMessageType
	}
}

// handleSendMessage processes send message requests
func (c *Connection) handleSendMessage(msg IncomingMessage, chatService types.ChatService) error {
	if msg.ConversationID == 0 || msg.Content == "" {
		return ErrInvalidMessage
	}

	message, err := chatService.SendMessage(c.userID, msg.ConversationID, msg.Content)
	if err != nil {
		logger.ErrorWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID).WithAction("send_message"), "Failed to send chat message: %v", err)
		return err
	}

	// Send confirmation to sender
	c.sendMessage(OutgoingMessage{
		Type:           MessageTypeNewMessage,
		ConversationID: msg.ConversationID,
		Data: MessageData{
			ID:        message.ID,
			SenderID:  message.SenderID,
			Message:   message.Msg,
			Timestamp: message.Time,
			ReadAt:    message.ReadAt,
		},
		Timestamp: time.Now(),
	})

	// Update monitoring stats (would normally be done via callback or interface)
	logger.InfoWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID).WithConversation(msg.ConversationID).WithAction("message_sent"), "Message sent successfully")

	return nil
}

// handleJoinConversation processes join conversation requests
func (c *Connection) handleJoinConversation(msg IncomingMessage, chatService types.ChatService) error {
	if msg.ConversationID == 0 {
		return ErrInvalidConversation
	}

	err := chatService.MarkMessagesAsRead(c.userID, msg.ConversationID)
	if err != nil {
		if err.Error() == "conversation not found" {
			logger.ErrorWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID).WithConversation(msg.ConversationID), "Conversation not found (404)")
		} else if err.Error() == "access denied" {
			logger.ErrorWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID).WithConversation(msg.ConversationID), "Access denied to conversation")
		}
		logger.ErrorWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID).WithAction("access_validation"), "Access denied: %s", err.Error())
		return err
	}

	logger.DebugWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID).WithDuration(1*time.Millisecond), "Message processing completed")
	return nil
}

// handleTyping processes typing notifications
func (c *Connection) handleTyping(msg IncomingMessage) error {
	if msg.ConversationID == 0 {
		return ErrInvalidConversation
	}

	c.hub.BroadcastToConversation(msg.ConversationID, OutgoingMessage{
		Type:           MessageTypeTyping,
		ConversationID: msg.ConversationID,
		Data: TypingData{
			UserID:   c.userID,
			IsTyping: msg.IsTyping,
		},
		Timestamp: time.Now(),
	}, c.userID) // Exclude sender

	return nil
}

// checkRateLimit checks if the user is sending messages too quickly
func (c *Connection) checkRateLimit() bool {
	c.rateMutex.Lock()
	defer c.rateMutex.Unlock()

	now := time.Now()
	maxMessages := 10                 // Max 10 messages
	windowDuration := 1 * time.Minute // Per minute

	// Remove old messages outside the time window
	cutoff := now.Add(-windowDuration)
	newTimes := make([]time.Time, 0)
	for _, msgTime := range c.messageTimes {
		if msgTime.After(cutoff) {
			newTimes = append(newTimes, msgTime)
		}
	}
	c.messageTimes = newTimes

	// Check if we're over the limit
	if len(c.messageTimes) >= maxMessages {
		logger.WarnWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID).WithAction("rate_limit").WithExtra("message_count", len(c.messageTimes)), "Rate limit exceeded: %d messages in last minute", len(c.messageTimes))
		return false
	}

	// Add current message time
	c.messageTimes = append(c.messageTimes, now)
	return true
}