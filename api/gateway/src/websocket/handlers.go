package websocket

import (
	"fmt"
	"time"

	"gateway/src/middleware"
	"gateway/src/utils"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Message represents a WebSocket message with routing information
type Message struct {
	Type string `json:"type"` // "chat", "notification", "subscribe", etc.
	Data any    `json:"data"`
	To   string `json:"to,omitempty"`   // Pour cibler un service spécifique
	From string `json:"from,omitempty"` // Pour identifier l'expéditeur
	// Reaction fields (sent directly by frontend, not nested in data)
	MessageID uint   `json:"message_id,omitempty"`
	Emoji     string `json:"emoji,omitempty"`
	// Conversation ID for various message types
	ConversationID string `json:"conversation_id,omitempty"`
	Content        string `json:"content,omitempty"`
	IsTyping       bool   `json:"is_typing,omitempty"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: secureCheckOrigin,
}

// UnifiedWebSocketHandler creates a unified WebSocket handler that routes messages by type
func UnifiedWebSocketHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		
		// Upgrade HTTP connection to WebSocket
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			LogError("unknown", "upgrade_failed", err, "remote_addr:", c.RemoteIP())
			return
		}
		defer conn.Close()

		// Get user ID from context (set by JWT middleware)
		userIDInterface, exists := c.Get(middleware.CtxUserIDKey)
		if !exists {
			LogError("unknown", "missing_user_id", fmt.Errorf("no user ID in WebSocket context"))
			return
		}
		userID := userIDInterface.(string)

		// Get JWT token for potential forwarding
		token := utils.ExtractToken(c)

		LogConnection(userID, "established", "remote_addr:", c.RemoteIP())

		// Create client and register with manager
		client := NewClient(userID, conn)
		client.Token = token
		GlobalManager.RegisterClient(client)
		defer func() {
			GlobalManager.UnregisterClient(client)
			LogConnection(userID, "closed", "duration:", time.Since(startTime))
		}()

		// Start goroutine to handle outgoing messages
		go handleClientWrites(client)

		// Handle incoming WebSocket messages
		for {
			var msg Message
			err := conn.ReadJSON(&msg)
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					LogError(userID, "read_error", err)
				}
				break
			}

			LogMessage(userID, msg.Type, "data_size:", len(fmt.Sprintf("%v", msg.Data)))

			// Route message based on type
			switch MessageType(msg.Type) {
			case MessageTypeChat:
				HandleChatMessage(msg, userID, token)
			case MessageTypeSendMessage:
				HandleChatMessage(msg, userID, token)
			case MessageTypeNotification:
				HandleNotificationMessage(msg, userID, token)
			case MessageTypeSubscribe:
				HandleSubscription(msg, userID)
			case MessageTypeUnsubscribe:
				HandleUnsubscription(msg, userID)
			case MessageTypePing:
				HandlePing(msg, userID)
			case MessageTypeReactionAdd:
				HandleReactionMessage(msg, userID, token, "add")
			case MessageTypeReactionRemove:
				HandleReactionMessage(msg, userID, token, "remove")
			case MessageTypeJoinConversation:
				HandleJoinConversation(msg, userID, token)
			case MessageTypeTyping:
				HandleTypingMessage(msg, userID, token)
			default:
				LogError(userID, "unknown_message_type", fmt.Errorf("unknown message type: %s", msg.Type))
				SendErrorToUser(userID, "unknown_message_type", fmt.Sprintf("Unknown message type: %s", msg.Type))
			}
		}
	}
}

// handleClientWrites handles outgoing messages for a client
func handleClientWrites(client *Client) {
	defer client.Conn.Close()
	
	ticker := time.NewTicker(54 * time.Second) // Ping every 54 seconds
	defer ticker.Stop()
	
	for {
		select {
		case message, ok := <-client.Send:
			if !ok {
				LogConnection(client.ID, "send_channel_closed")
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			
			if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				LogError(client.ID, "write_error", err, "message_size:", len(message))
				return
			}
			
		case <-ticker.C:
			// Send ping to keep connection alive and update last ping
			client.UpdateLastPing()
			if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				LogError(client.ID, "ping_error", err)
				return
			}
		}
	}
}

// HandleChatMessage routes chat messages to chat service via WebSocket
func HandleChatMessage(msg Message, userID, token string) {
	startTime := time.Now()
	defer func() {
		LogPerformance("chat_message", time.Since(startTime), "user:", userID)
	}()

	// Parse chat message data
	chatData, err := parseChatMessageData(msg.Data)
	if err != nil {
		LogError(userID, "chat_parse_error", err)
		SendErrorToUser(userID, "invalid_chat_data", err.Error())
		return
	}

	// Validate required fields
	if chatData.ConversationID == "" {
		LogError(userID, "chat_validation_error", fmt.Errorf("missing conversation_id"))
		SendErrorToUser(userID, "missing_conversation_id", "Missing conversation_id in chat message")
		return
	}

	if chatData.Message == "" {
		LogError(userID, "chat_validation_error", fmt.Errorf("empty message"))
		SendErrorToUser(userID, "empty_message", "Message cannot be empty")
		return
	}

	LogMessage(userID, "chat_processing", "conversation:", chatData.ConversationID, "message_length:", len(chatData.Message))

	// Validate user access to conversation
	if !validateUserInConversation(userID, chatData.ConversationID, token) {
		LogError(userID, "chat_access_denied", fmt.Errorf("access denied to conversation %s", chatData.ConversationID))
		SendErrorToUser(userID, "access_denied", "Access denied to conversation")
		return
	}

	// Check if chat service client is connected
	if GlobalChatClient == nil || !GlobalChatClient.IsConnected() {
		LogError(userID, "chat_service_unavailable", fmt.Errorf("chat service WebSocket not available"))
		SendErrorToUser(userID, "service_unavailable", "Chat service is currently unavailable")
		return
	}

	// Send message through WebSocket to Chat Service
	err = GlobalChatClient.SendMessage(userID, chatData.ConversationID, chatData.Message, token)
	if err != nil {
		LogError(userID, "chat_relay_failed", err, "conversation:", chatData.ConversationID)
		SendErrorToUser(userID, "message_failed", "Failed to send message")
		return
	}

	LogMessage(userID, "chat_relayed", "conversation:", chatData.ConversationID)
}

// HandleNotificationMessage handles notification-related messages
func HandleNotificationMessage(msg Message, userID, token string) {
	LogMessage(userID, "notification_request", "action:", msg.Data)
	
	// Parse notification action data
	notifData, err := parseNotificationActionData(msg.Data)
	if err != nil {
		SendErrorToUser(userID, "invalid_notification_data", err.Error())
		return
	}
	
	switch notifData.Action {
	case "mark_read":
		if notifData.NotificationID == "" {
			SendErrorToUser(userID, "missing_notification_id", "Missing notification_id for mark_read action")
			return
		}
		
		// Call notification service to mark as read
		if err := markNotificationAsRead(userID, notifData.NotificationID, token); err != nil {
			LogError(userID, "notification_mark_read_failed", err, "notification_id:", notifData.NotificationID)
			SendErrorToUser(userID, "notification_service_error", fmt.Sprintf("Failed to mark notification as read: %s", err.Error()))
			return
		}
		
		GlobalManager.SendToUser(userID, string(MessageTypeNotificationRead), map[string]any{
			"notification_id": notifData.NotificationID,
			"status":         "read",
			"timestamp":      time.Now().Unix(),
		})
		
	case "mark_all_read":
		// Call notification service to mark all as read
		if err := markAllNotificationsAsRead(userID, token); err != nil {
			LogError(userID, "notification_mark_all_read_failed", err)
			SendErrorToUser(userID, "notification_service_error", fmt.Sprintf("Failed to mark all notifications as read: %s", err.Error()))
			return
		}
		
		GlobalManager.SendToUser(userID, string(MessageTypeAllNotificationRead), map[string]any{
			"status":    "all_read",
			"timestamp": time.Now().Unix(),
		})
		
	default:
		SendErrorToUser(userID, "unknown_notification_action", 
			fmt.Sprintf("Unknown notification action: %s", notifData.Action))
	}
}

// HandleSubscription manages user subscriptions to different channels
func HandleSubscription(msg Message, userID string) {
	channel, ok := msg.Data.(string)
	if !ok {
		SendErrorToUser(userID, "invalid_subscription_data", "Channel name must be a string")
		return
	}
	
	// Validate channel name format
	if !isValidChannelName(channel) {
		SendErrorToUser(userID, "invalid_channel_name", "Invalid channel name format")
		return
	}
	
	LogSubscription(userID, channel, "subscribe")
	GlobalManager.SubscribeToChannel(userID, channel)
	
	// Send confirmation
	GlobalManager.SendToUser(userID, string(MessageTypeSubscriptionAck), map[string]any{
		"channel": channel,
		"status": "subscribed",
		"timestamp": time.Now().Unix(),
	})
}

// HandleUnsubscription manages user unsubscriptions from channels
func HandleUnsubscription(msg Message, userID string) {
	channel, ok := msg.Data.(string)
	if !ok {
		SendErrorToUser(userID, "invalid_unsubscription_data", "Channel name must be a string")
		return
	}
	
	GlobalManager.UnsubscribeFromChannel(userID, channel)
	
	// Send confirmation
	GlobalManager.SendToUser(userID, "unsubscription_ack", map[string]any{
		"channel": channel,
		"status": "unsubscribed",
		"timestamp": time.Now(),
	})
}

// HandlePing responds to ping messages to keep connection alive
func HandlePing(msg Message, userID string) {
	GlobalManager.SendToUser(userID, "pong", map[string]any{
		"timestamp": time.Now(),
	})
}

// SendErrorToUser sends an error message to a specific user
func SendErrorToUser(userID, errorType, errorMessage string) {
	LogError(userID, "user_error_sent", fmt.Errorf("error_type: %s, message: %s", errorType, errorMessage))
	
	errorData := ErrorData{
		ErrorType: errorType,
		Message:   errorMessage,
		Timestamp: time.Now().Unix(),
	}
	
	GlobalManager.SendToUser(userID, string(MessageTypeError), errorData)
}

// isValidChannelName validates channel name format
func isValidChannelName(channel string) bool {
	// Allow alphanumeric, underscore, and hyphen
	// Examples: "notifications", "chat_123", "user-updates"
	if len(channel) == 0 || len(channel) > 50 {
		return false
	}
	
	for _, r := range channel {
		if !((r >= 'a' && r <= 'z') || 
			 (r >= 'A' && r <= 'Z') || 
			 (r >= '0' && r <= '9') || 
			 r == '_' || r == '-') {
			return false
		}
	}
	
	return true
}

// parseChatMessageData parses and validates chat message data
func parseChatMessageData(data any) (*ChatMessageData, error) {
	dataMap, ok := data.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invalid data format: expected map[string]any")
	}
	
	chatData := &ChatMessageData{}
	
	if convID, exists := dataMap["conversation_id"]; exists {
		if convIDStr, ok := convID.(string); ok {
			chatData.ConversationID = convIDStr
		} else {
			return nil, fmt.Errorf("conversation_id must be a string")
		}
	}
	
	if message, exists := dataMap["message"]; exists {
		if messageStr, ok := message.(string); ok {
			chatData.Message = messageStr
		} else {
			return nil, fmt.Errorf("message must be a string")
		}
	}
	
	return chatData, nil
}

// parseNotificationActionData parses and validates notification action data
func parseNotificationActionData(data any) (*NotificationActionData, error) {
	dataMap, ok := data.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invalid data format: expected map[string]any")
	}

	notifData := &NotificationActionData{}

	if action, exists := dataMap["action"]; exists {
		if actionStr, ok := action.(string); ok {
			notifData.Action = actionStr
		} else {
			return nil, fmt.Errorf("action must be a string")
		}
	} else {
		return nil, fmt.Errorf("missing required field: action")
	}

	if notifID, exists := dataMap["notification_id"]; exists {
		if notifIDStr, ok := notifID.(string); ok {
			notifData.NotificationID = notifIDStr
		} else {
			return nil, fmt.Errorf("notification_id must be a string")
		}
	}

	return notifData, nil
}

// HandleReactionMessage handles reaction add/remove messages
func HandleReactionMessage(msg Message, userID, token, action string) {
	startTime := time.Now()
	defer func() {
		LogPerformance("reaction_"+action, time.Since(startTime), "user:", userID)
	}()

	// Validate required fields - now using direct fields from Message structure
	if msg.MessageID == 0 {
		LogError(userID, "reaction_validation_error", fmt.Errorf("missing message_id"))
		SendErrorToUser(userID, "missing_message_id", "Missing message_id in reaction")
		return
	}

	if msg.Emoji == "" {
		LogError(userID, "reaction_validation_error", fmt.Errorf("missing emoji"))
		SendErrorToUser(userID, "missing_emoji", "Missing emoji in reaction")
		return
	}

	// Validate emoji (basic validation)
	if len(msg.Emoji) > 10 {
		LogError(userID, "reaction_validation_error", fmt.Errorf("invalid emoji length"))
		SendErrorToUser(userID, "invalid_emoji", "Invalid emoji")
		return
	}

	LogMessage(userID, "reaction_processing", "action:", action, "message_id:", msg.MessageID, "emoji:", msg.Emoji)

	// Check if chat service client is connected
	if GlobalChatClient == nil || !GlobalChatClient.IsConnected() {
		LogError(userID, "chat_service_unavailable", fmt.Errorf("chat service WebSocket not available"))
		SendErrorToUser(userID, "service_unavailable", "Chat service is currently unavailable")
		return
	}

	// Send reaction through WebSocket to Chat Service
	err := GlobalChatClient.SendReaction(userID, msg.MessageID, msg.Emoji, action, token)
	if err != nil {
		LogError(userID, "reaction_relay_failed", err, "message_id:", msg.MessageID)
		SendErrorToUser(userID, "reaction_failed", "Failed to process reaction")
		return
	}

	LogMessage(userID, "reaction_relayed", "action:", action, "message_id:", msg.MessageID)
}


// HandleJoinConversation handles joining a conversation
func HandleJoinConversation(msg Message, userID, token string) {
	LogMessage(userID, "join_conversation", "data:", msg.Data)
	// This could be used for presence or room management
	// For now, just acknowledge
	GlobalManager.SendToUser(userID, string(MessageTypeConnectionAck), map[string]any{
		"status": "joined",
		"timestamp": time.Now().Unix(),
	})
}

// HandleTypingMessage handles typing indicators
func HandleTypingMessage(msg Message, userID, token string) {
	LogMessage(userID, "typing_indicator", "data:", msg.Data)

	// Parse typing data
	dataMap, ok := msg.Data.(map[string]any)
	if !ok {
		SendErrorToUser(userID, "invalid_typing_data", "Invalid typing data format")
		return
	}

	conversationID, exists := dataMap["conversation_id"]
	if !exists {
		SendErrorToUser(userID, "missing_conversation_id", "Missing conversation_id in typing message")
		return
	}

	// Forward typing indicator to chat service
	if GlobalChatClient != nil && GlobalChatClient.IsConnected() {
		err := GlobalChatClient.SendTyping(userID, conversationID.(string), token)
		if err != nil {
			LogError(userID, "typing_relay_failed", err)
		}
	}
}