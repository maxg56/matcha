package websocket

import (
	"chat-service/src/logger"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
)

// GatewayMessage represents messages from Gateway
type GatewayMessage struct {
	Type           string                 `json:"type"`
	UserID         string                 `json:"user_id"`
	ConversationID string                 `json:"conversation_id"`
	Content        string                 `json:"content,omitempty"`
	Token          string                 `json:"token,omitempty"`
	RequestID      string                 `json:"request_id,omitempty"`
	Data           map[string]interface{} `json:"data,omitempty"`
}

// GatewayResponse represents responses to Gateway
type GatewayResponse struct {
	Type           string                 `json:"type"`
	RequestID      string                 `json:"request_id,omitempty"`
	Status         string                 `json:"status,omitempty"`
	Message        string                 `json:"message,omitempty"`
	ConversationID string                 `json:"conversation_id,omitempty"`
	UserID         string                 `json:"user_id,omitempty"`
	Data           map[string]interface{} `json:"data,omitempty"`
	Error          string                 `json:"error,omitempty"`
}

// HandleGatewayConnection handles WebSocket connection from Gateway
func (h *Hub) HandleGatewayConnection(conn *websocket.Conn) {
	logger.InfoWithContext(logger.WithComponent("websocket_hub").WithAction("gateway_connection"), "Gateway WebSocket connection established")

	defer func() {
		conn.Close()
		logger.InfoWithContext(logger.WithComponent("websocket_hub").WithAction("gateway_disconnection"), "Gateway WebSocket connection closed")
	}()

	// Set read deadline for ping/pong
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	// Listen for messages from Gateway
	for {
		var gatewayMsg GatewayMessage
		err := conn.ReadJSON(&gatewayMsg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logger.ErrorWithContext(logger.WithComponent("websocket_hub").WithAction("gateway_read_error"), "Gateway WebSocket read error: %v", err)
			}
			break
		}

		// Handle the message from Gateway
		h.handleGatewayMessage(gatewayMsg, conn)
	}
}

// handleGatewayMessage processes messages from Gateway
func (h *Hub) handleGatewayMessage(msg GatewayMessage, conn *websocket.Conn) {
	logger.DebugWithContext(
		logger.WithComponent("websocket_hub").WithAction("gateway_message"),
		"Received from Gateway: type=%s, user=%s", msg.Type, msg.UserID,
	)

	switch msg.Type {
	case "chat_message":
		h.handleGatewayChatMessage(msg, conn)
	case "join_conversation":
		h.handleGatewayJoinConversation(msg, conn)
	case "typing":
		h.handleGatewayTyping(msg, conn)
	case "reaction_add":
		h.handleGatewayReactionAdd(msg, conn)
	case "reaction_remove":
		h.handleGatewayReactionRemove(msg, conn)
	default:
		logger.WarnWithContext(
			logger.WithComponent("websocket_hub").WithAction("unknown_gateway_message"),
			"Unknown message type from Gateway: %s", msg.Type,
		)
	}
}

// handleGatewayChatMessage handles chat messages from Gateway
func (h *Hub) handleGatewayChatMessage(msg GatewayMessage, conn *websocket.Conn) {
	// Parse user and conversation IDs
	userID := parseUintFromString(msg.UserID)
	conversationID := parseUintFromString(msg.ConversationID)

	if userID == 0 || conversationID == 0 || msg.Content == "" {
		h.sendErrorToGateway(conn, msg.RequestID, "Invalid message parameters")
		return
	}

	// Send message through chat service
	message, err := h.chatService.SendMessage(userID, conversationID, msg.Content)
	if err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub").WithUser(userID).WithConversation(conversationID),
			"Failed to send message via Gateway: %v", err,
		)
		h.sendErrorToGateway(conn, msg.RequestID, err.Error())
		return
	}

	// Send the message back to Gateway for broadcasting to users
	broadcastResponse := GatewayResponse{
		Type:           "chat_message",
		ConversationID: msg.ConversationID,
		UserID:         msg.UserID,
		Message:        message.Msg,
		Data: map[string]interface{}{
			"message_id":   message.ID,
			"sender_id":    message.SenderID,
			"message":      message.Msg,
			"timestamp":    message.Time.Unix(),
			"read_at":      message.ReadAt,
		},
	}

	if err := conn.WriteJSON(broadcastResponse); err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub"),
			"Failed to send broadcast message to Gateway: %v", err,
		)
	}

	// Send acknowledgment to Gateway
	ackResponse := GatewayResponse{
		Type:           "chat_ack",
		RequestID:      msg.RequestID,
		Status:         "success",
		ConversationID: msg.ConversationID,
		UserID:         msg.UserID,
		Data: map[string]interface{}{
			"message_id": message.ID,
			"timestamp":  message.Time.Unix(),
		},
	}

	if err := conn.WriteJSON(ackResponse); err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub"),
			"Failed to send ack to Gateway: %v", err,
		)
	}

	logger.InfoWithContext(
		logger.WithComponent("websocket_hub").WithUser(userID).WithConversation(conversationID),
		"Message relayed from Gateway successfully",
	)
}

// handleGatewayJoinConversation handles join requests from Gateway
func (h *Hub) handleGatewayJoinConversation(msg GatewayMessage, conn *websocket.Conn) {
	userID := parseUintFromString(msg.UserID)
	conversationID := parseUintFromString(msg.ConversationID)

	if userID == 0 || conversationID == 0 {
		h.sendErrorToGateway(conn, msg.RequestID, "Invalid join parameters")
		return
	}

	err := h.chatService.MarkMessagesAsRead(userID, conversationID)
	if err != nil {
		h.sendErrorToGateway(conn, msg.RequestID, err.Error())
		return
	}

	// Send success response
	response := GatewayResponse{
		Type:           "response",
		RequestID:      msg.RequestID,
		Status:         "success",
		ConversationID: msg.ConversationID,
		UserID:         msg.UserID,
	}

	if err := conn.WriteJSON(response); err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub"),
			"Failed to send join response to Gateway: %v", err,
		)
	}
}

// handleGatewayTyping handles typing notifications from Gateway
func (h *Hub) handleGatewayTyping(msg GatewayMessage, conn *websocket.Conn) {
	userID := parseUintFromString(msg.UserID)
	conversationID := parseUintFromString(msg.ConversationID)

	if userID == 0 || conversationID == 0 {
		return
	}

	isTyping := false
	if msg.Data != nil {
		if typing, ok := msg.Data["is_typing"].(bool); ok {
			isTyping = typing
		}
	}

	// Broadcast typing notification to other users in conversation
	typingMsg := OutgoingMessage{
		Type:           MessageTypeTyping,
		ConversationID: conversationID,
		Data: TypingData{
			UserID:   userID,
			IsTyping: isTyping,
		},
		Timestamp: time.Now(),
	}

	h.BroadcastToConversation(conversationID, typingMsg, userID)
}

// sendErrorToGateway sends error response to Gateway
func (h *Hub) sendErrorToGateway(conn *websocket.Conn, requestID, errorMsg string) {
	response := GatewayResponse{
		Type:      "response",
		RequestID: requestID,
		Status:    "error",
		Error:     errorMsg,
	}

	if err := conn.WriteJSON(response); err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub"),
			"Failed to send error to Gateway: %v", err,
		)
	}
}

// handleGatewayReactionAdd handles reaction add requests from Gateway
func (h *Hub) handleGatewayReactionAdd(msg GatewayMessage, conn *websocket.Conn) {
	userID := parseUintFromString(msg.UserID)
	if userID == 0 {
		h.sendErrorToGateway(conn, msg.RequestID, "Invalid user ID")
		return
	}
	// Extract message_id and emoji from Data
	var messageID uint
	var emoji string

	if msg.Data != nil {
		if msgIDInterface, exists := msg.Data["message_id"]; exists {
			switch msgIDVal := msgIDInterface.(type) {
			case float64:
				messageID = uint(msgIDVal)
			case int:
				messageID = uint(msgIDVal)
			case uint:
				messageID = msgIDVal
			default:
				h.sendErrorToGateway(conn, msg.RequestID, "Invalid message_id format")
				return
			}
		}

		if emojiInterface, exists := msg.Data["emoji"]; exists {
			if emojiStr, ok := emojiInterface.(string); ok {
				emoji = emojiStr
			} else {
				h.sendErrorToGateway(conn, msg.RequestID, "Invalid emoji format")
				return
			}
		}
	}

	if messageID == 0 || emoji == "" {
		h.sendErrorToGateway(conn, msg.RequestID, "Missing message_id or emoji")
		return
	}

	// Add reaction through chat service
	reaction, err := h.chatService.AddReaction(userID, messageID, emoji)

	// Handle the case where reaction was toggled (removed)
	isToggleRemoval := false
	if err != nil {
		if err.Error() == "reaction_removed" {
			// This was a toggle operation - reaction was removed
			isToggleRemoval = true
			logger.InfoWithContext(
				logger.WithComponent("websocket_hub").WithUser(userID),
				"Reaction toggled (removed): message=%d, emoji=%s", messageID, emoji,
			)
		} else {
			// Real error occurred
			logger.ErrorWithContext(
				logger.WithComponent("websocket_hub").WithUser(userID),
				"Failed to add reaction via Gateway: %v", err,
			)
			h.sendErrorToGateway(conn, msg.RequestID, err.Error())
			return
		}
	}

	// Get the message to find the conversation ID for broadcasting
	message, err := h.chatService.GetMessage(messageID)
	if err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub").WithUser(userID),
			"Failed to get message for reaction broadcast: %v", err,
		)
		return
	}

	// Determine action and prepare data
	action := "add"
	broadcastData := map[string]interface{}{
		"conversation_id": message.ConvID,
		"message_id":      messageID,
		"user_id":         userID,
		"emoji":           emoji,
		"timestamp":       time.Now().Unix(),
	}

	if isToggleRemoval {
		action = "remove"
		// For removal, we don't have reaction_id since it was deleted
	} else {
		// For addition, include reaction details
		broadcastData["reaction_id"] = reaction.ID
		broadcastData["timestamp"] = reaction.CreatedAt.Unix()
	}
	broadcastData["action"] = action

	// Send reaction update to Gateway for broadcasting to all conversation participants
	broadcastResponse := GatewayResponse{
		Type:           "reaction_update",
		ConversationID: strconv.FormatUint(uint64(message.ConvID), 10),
		UserID:         strconv.FormatUint(uint64(userID), 10),
		Data:           broadcastData,
	}

	if err := conn.WriteJSON(broadcastResponse); err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub"),
			"Failed to send reaction broadcast to Gateway: %v", err,
		)
	}

	logger.InfoWithContext(
		logger.WithComponent("websocket_hub").WithUser(userID),
		"Reaction add relayed from Gateway successfully: message=%d, emoji=%s", messageID, emoji,
	)
}

// handleGatewayReactionRemove handles reaction remove requests from Gateway
func (h *Hub) handleGatewayReactionRemove(msg GatewayMessage, conn *websocket.Conn) {
	userID := parseUintFromString(msg.UserID)
	if userID == 0 {
		h.sendErrorToGateway(conn, msg.RequestID, "Invalid user ID")
		return
	}

	// Extract message_id and emoji from Data
	var messageID uint
	var emoji string

	if msg.Data != nil {
		if msgIDInterface, exists := msg.Data["message_id"]; exists {
			switch msgIDVal := msgIDInterface.(type) {
			case float64:
				messageID = uint(msgIDVal)
			case int:
				messageID = uint(msgIDVal)
			case uint:
				messageID = msgIDVal
			default:
				h.sendErrorToGateway(conn, msg.RequestID, "Invalid message_id format")
				return
			}
		}

		if emojiInterface, exists := msg.Data["emoji"]; exists {
			if emojiStr, ok := emojiInterface.(string); ok {
				emoji = emojiStr
			} else {
				h.sendErrorToGateway(conn, msg.RequestID, "Invalid emoji format")
				return
			}
		}
	}

	if messageID == 0 || emoji == "" {
		h.sendErrorToGateway(conn, msg.RequestID, "Missing message_id or emoji")
		return
	}

	// Remove reaction through chat service
	err := h.chatService.RemoveReaction(userID, messageID, emoji)
	if err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub").WithUser(userID),
			"Failed to remove reaction via Gateway: %v", err,
		)
		h.sendErrorToGateway(conn, msg.RequestID, err.Error())
		return
	}

	// Get the message to find the conversation ID for broadcasting
	message, err := h.chatService.GetMessage(messageID)
	if err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub").WithUser(userID),
			"Failed to get message for reaction broadcast: %v", err,
		)
		return
	}

	// Send reaction removal to Gateway for broadcasting to all conversation participants
	broadcastResponse := GatewayResponse{
		Type:           "reaction_update",
		ConversationID: strconv.FormatUint(uint64(message.ConvID), 10),
		UserID:         strconv.FormatUint(uint64(userID), 10),
		Data: map[string]interface{}{
			"conversation_id": message.ConvID,
			"message_id":      messageID,
			"user_id":         userID,
			"emoji":           emoji,
			"action":          "remove",
			"timestamp":       time.Now().Unix(),
		},
	}

	if err := conn.WriteJSON(broadcastResponse); err != nil {
		logger.ErrorWithContext(
			logger.WithComponent("websocket_hub"),
			"Failed to send reaction broadcast to Gateway: %v", err,
		)
	}

	logger.InfoWithContext(
		logger.WithComponent("websocket_hub").WithUser(userID),
		"Reaction remove relayed from Gateway successfully: message=%d, emoji=%s", messageID, emoji,
	)
}

// parseUintFromString safely parses a string to uint
func parseUintFromString(s string) uint {
	if s == "" {
		return 0
	}

	val, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		logger.WarnWithContext(logger.WithComponent("websocket_hub"), "Failed to parse uint from string: %s", s)
		return 0
	}

	return uint(val)
}