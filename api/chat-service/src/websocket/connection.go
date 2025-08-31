package websocket

import (
	"chat-service/src/types"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Connection wraps a WebSocket connection with user info
type Connection struct {
	conn     *websocket.Conn
	userID   uint
	send     chan OutgoingMessage
	hub      *Hub
	mutex    sync.Mutex
	lastPing time.Time
}

// NewConnection creates a new WebSocket connection
func NewConnection(conn *websocket.Conn, userID uint, hub *Hub) *Connection {
	return &Connection{
		conn:     conn,
		userID:   userID,
		send:     make(chan OutgoingMessage, 256),
		hub:      hub,
		lastPing: time.Now(),
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
	return nil
}

// SetWriteDeadline implements types.WebSocketConnection
func (c *Connection) SetWriteDeadline(deadline any) error {
	if t, ok := deadline.(time.Time); ok {
		return c.conn.SetWriteDeadline(t)
	}
	return nil
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
				log.Printf("WebSocket error for user %d: %v", c.userID, err)
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
				log.Printf("Write error for user %d: %v", c.userID, err)
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

	return nil
}

// handleJoinConversation processes join conversation requests
func (c *Connection) handleJoinConversation(msg IncomingMessage, chatService types.ChatService) error {
	if msg.ConversationID == 0 {
		return ErrInvalidConversation
	}

	err := chatService.MarkMessagesAsRead(c.userID, msg.ConversationID)
	if err != nil {
		log.Printf("Failed to mark messages as read: %v", err)
	}

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

// cleanup handles connection cleanup
func (c *Connection) cleanup() {
	c.hub.unregister <- c
	c.conn.Close()
}