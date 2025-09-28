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
	case MessageTypeReactionAdd:
		return c.handleReactionAdd(msg, chatService)
	case MessageTypeReactionRemove:
		return c.handleReactionRemove(msg, chatService)
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

// handleReactionAdd processes add reaction requests
func (c *Connection) handleReactionAdd(msg IncomingMessage, chatService types.ChatService) error {
	if msg.MessageID == 0 || msg.Emoji == "" {
		return ErrInvalidMessage
	}

	_, err := chatService.AddReaction(c.userID, msg.MessageID, msg.Emoji)
	if err != nil {
		logger.ErrorWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID).WithAction("add_reaction"), "Failed to add reaction: %v", err)
		return err
	}

	// Get the conversation ID from the message
	message, err := chatService.GetMessage(msg.MessageID)
	if err != nil {
		logger.ErrorWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID).WithAction("get_message"), "Failed to get message: %v", err)
		return err
	}

	// Broadcast reaction to conversation participants using the same mechanism as messages
	reactionMsg := OutgoingMessage{
		Type:           MessageTypeReactionUpdate,
		ConversationID: message.ConvID,
		Data: ReactionData{
			MessageID: msg.MessageID,
			UserID:    c.userID,
			Emoji:     msg.Emoji,
			Action:    "add",
		},
		Timestamp: time.Now(),
	}

	logger.InfoWithContext(
		logger.WithComponent("websocket_conn").WithUser(c.userID).WithConversation(message.ConvID),
		"🚀 Broadcasting reaction ADD: messageID=%d, emoji=%s, userID=%d",
		msg.MessageID, msg.Emoji, c.userID,
	)

	c.hub.BroadcastToConversation(message.ConvID, reactionMsg, 0) // Don't exclude anyone, everyone should see reactions

	logger.InfoWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID).WithAction("reaction_added"), "Reaction added successfully")
	return nil
}

// handleReactionRemove processes remove reaction requests
func (c *Connection) handleReactionRemove(msg IncomingMessage, chatService types.ChatService) error {
	if msg.MessageID == 0 || msg.Emoji == "" {
		return ErrInvalidMessage
	}

	err := chatService.RemoveReaction(c.userID, msg.MessageID, msg.Emoji)
	if err != nil {
		logger.ErrorWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID).WithAction("remove_reaction"), "Failed to remove reaction: %v", err)
		return err
	}

	// Get the conversation ID from the message
	message, err := chatService.GetMessage(msg.MessageID)
	if err != nil {
		logger.ErrorWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID).WithAction("get_message"), "Failed to get message: %v", err)
		return err
	}

	// Broadcast reaction removal to conversation participants using the same mechanism as messages
	reactionMsg := OutgoingMessage{
		Type:           MessageTypeReactionUpdate,
		ConversationID: message.ConvID,
		Data: ReactionData{
			MessageID: msg.MessageID,
			UserID:    c.userID,
			Emoji:     msg.Emoji,
			Action:    "remove",
		},
		Timestamp: time.Now(),
	}

	logger.InfoWithContext(
		logger.WithComponent("websocket_conn").WithUser(c.userID).WithConversation(message.ConvID),
		"🚀 Broadcasting reaction REMOVE: messageID=%d, emoji=%s, userID=%d",
		msg.MessageID, msg.Emoji, c.userID,
	)

	c.hub.BroadcastToConversation(message.ConvID, reactionMsg, 0) // Don't exclude anyone, everyone should see reaction removals

	logger.InfoWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID).WithAction("reaction_removed"), "Reaction removed successfully")
	return nil
}

// getMessageConversationParticipants helper to get conversation participants for a message
func (c *Connection) getMessageConversationParticipants(messageID uint, chatService types.ChatService) ([]uint, error) {
	// Get the message to find its conversation ID
	message, err := c.hub.repository.GetMessage(messageID)
	if err != nil {
		return nil, err
	}

	// Get the conversation participants
	participants, err := c.hub.repository.GetConversationParticipants(message.ConvID)
	if err != nil {
		return nil, err
	}

	return participants, nil
}