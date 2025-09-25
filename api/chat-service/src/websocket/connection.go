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