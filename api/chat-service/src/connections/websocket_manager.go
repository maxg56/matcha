package connections

import (
	"chat-service/src/types"
	"encoding/json"
	"log"
	"sync"
	
	"github.com/gorilla/websocket"
)

type wsConnection struct {
	conn   *websocket.Conn
	userID uint
	send   chan []byte
}

func (w *wsConnection) WriteMessage(messageType int, data []byte) error {
	return w.conn.WriteMessage(messageType, data)
}

func (w *wsConnection) ReadMessage() (int, []byte, error) {
	return w.conn.ReadMessage()
}

func (w *wsConnection) Close() error {
	return w.conn.Close()
}

func (w *wsConnection) SetReadDeadline(deadline interface{}) error {
	// Type assertion would be needed here for proper implementation
	return nil
}

func (w *wsConnection) SetWriteDeadline(deadline interface{}) error {
	// Type assertion would be needed here for proper implementation
	return nil
}

type connectionManager struct {
	connections map[uint]types.WebSocketConnection
	mutex       sync.RWMutex
}

func NewConnectionManager() types.ConnectionManager {
	return &connectionManager{
		connections: make(map[uint]types.WebSocketConnection),
	}
}

func (cm *connectionManager) AddConnection(userID uint, conn types.WebSocketConnection) error {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()
	
	cm.connections[userID] = conn
	log.Printf("User %d connected, total connections: %d", userID, len(cm.connections))
	
	return nil
}

func (cm *connectionManager) RemoveConnection(userID uint) error {
	cm.mutex.Lock()
	defer cm.mutex.Unlock()
	
	if conn, exists := cm.connections[userID]; exists {
		conn.Close()
		delete(cm.connections, userID)
		log.Printf("User %d disconnected, total connections: %d", userID, len(cm.connections))
	}
	
	return nil
}

func (cm *connectionManager) GetConnection(userID uint) (types.WebSocketConnection, bool) {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	
	conn, exists := cm.connections[userID]
	return conn, exists
}

func (cm *connectionManager) BroadcastToUsers(userIDs []uint, message interface{}) error {
	data, err := json.Marshal(message)
	if err != nil {
		return err
	}
	
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	
	for _, userID := range userIDs {
		if conn, exists := cm.connections[userID]; exists {
			go func(c types.WebSocketConnection) {
				if err := c.WriteMessage(websocket.TextMessage, data); err != nil {
					log.Printf("Failed to send message to user %d: %v", userID, err)
				}
			}(conn)
		}
	}
	
	return nil
}

func (cm *connectionManager) IsUserOnline(userID uint) bool {
	cm.mutex.RLock()
	defer cm.mutex.RUnlock()
	
	_, exists := cm.connections[userID]
	return exists
}

// NewWebSocketConnection wraps a gorilla websocket connection
func NewWebSocketConnection(conn *websocket.Conn, userID uint) types.WebSocketConnection {
	return &wsConnection{
		conn:   conn,
		userID: userID,
		send:   make(chan []byte, 256),
	}
}