package websocket

import (
	"chat-service/src/logger"
	"chat-service/src/types"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Connection wraps a WebSocket connection with user info
type Connection struct {
	conn         *websocket.Conn
	userID       uint
	send         chan OutgoingMessage
	hub          *Hub
	mutex        sync.Mutex
	lastPing     time.Time
	
	// Rate limiting
	messageTimes []time.Time
	rateMutex    sync.Mutex
}

// NewConnection creates a new WebSocket connection
func NewConnection(conn *websocket.Conn, userID uint, hub *Hub) *Connection {
	return &Connection{
		conn:         conn,
		userID:       userID,
		send:         make(chan OutgoingMessage, 256),
		hub:          hub,
		lastPing:     time.Now(),
		messageTimes: make([]time.Time, 0),
	}
}

// WriteMessage implements types.WebSocketConnection
func (c *Connection) WriteMessage(messageType int, data []byte) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
	return c.conn.WriteMessage(messageType, data)
}

// ReadMessage implements types.WebSocketConnection
func (c *Connection) ReadMessage() (int, []byte, error) {
	return c.conn.ReadMessage()
}

// Close implements types.WebSocketConnection
func (c *Connection) Close() error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	
	close(c.send)
	return c.conn.Close()
}

// SetReadDeadline implements types.WebSocketConnection
func (c *Connection) SetReadDeadline(deadline any) error {
	if t, ok := deadline.(time.Time); ok {
		return c.conn.SetReadDeadline(t)
	}
	// If the type assertion fails, log warning and return error
	logger.WarnWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID), "Invalid deadline type for SetReadDeadline: %T", deadline)
	return ErrInvalidMessage
}

// SetWriteDeadline implements types.WebSocketConnection
func (c *Connection) SetWriteDeadline(deadline any) error {
	if t, ok := deadline.(time.Time); ok {
		return c.conn.SetWriteDeadline(t)
	}
	// If the type assertion fails, log warning and return error
	logger.WarnWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID), "Invalid deadline type for SetWriteDeadline: %T", deadline)
	return ErrInvalidMessage
}

// Start begins reading and writing for this connection
func (c *Connection) Start(chatService types.ChatService) {
	go c.writePump()
	go c.readPump(chatService)
}

// StartConnection automatically starts the connection when created
func (c *Connection) StartConnection(chatService types.ChatService) {
	c.Start(chatService)
}

// readPump handles incoming messages from the client
func (c *Connection) readPump(chatService types.ChatService) {
	defer c.cleanup()

	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.lastPing = time.Now()
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		var msg IncomingMessage
		err := c.conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logger.ErrorWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID), "WebSocket error: %v", err)
			}
			break
		}

		if err := c.handleMessage(msg, chatService); err != nil {
			c.sendError("HANDLE_ERROR", err.Error())
		}
	}
}

// writePump handles outgoing messages to the client
func (c *Connection) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteJSON(message); err != nil {
				logger.ErrorWithContext(logger.WithComponent("websocket_conn").WithUser(c.userID), "Write error: %v", err)
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

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

// sendMessage sends a message to this connection
func (c *Connection) sendMessage(msg OutgoingMessage) {
	select {
	case c.send <- msg:
	default:
		close(c.send)
	}
}

// sendError sends an error message to this connection
func (c *Connection) sendError(code, message string) {
	c.sendMessage(OutgoingMessage{
		Type: MessageTypeError,
		Data: ErrorData{
			Code:    code,
			Message: message,
		},
		Timestamp: time.Now(),
	})
}

// checkRateLimit checks if the user is sending messages too quickly
func (c *Connection) checkRateLimit() bool {
	c.rateMutex.Lock()
	defer c.rateMutex.Unlock()
	
	now := time.Now()
	maxMessages := 10                    // Max 10 messages
	windowDuration := 1 * time.Minute    // Per minute
	
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

// cleanup handles connection cleanup
func (c *Connection) cleanup() {
	c.hub.unregister <- c
	c.conn.Close()
}