package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"time"

	"gateway/src/services"

	"github.com/gorilla/websocket"
)

// NotificationClient manages the WebSocket connection to the notification service
type NotificationClient struct {
	conn          *websocket.Conn
	reconnecting  bool
	stopReconnect chan struct{}
}

// NotificationMessage represents incoming notification messages
type NotificationMessage struct {
	Type string `json:"type"`
	Data any    `json:"data"`
}

var notificationClient *NotificationClient

// InitNotificationClient initializes and starts the notification WebSocket client
func InitNotificationClient() {
	notificationClient = &NotificationClient{
		stopReconnect: make(chan struct{}),
	}
	
	go notificationClient.connect()
}

// connect establishes a WebSocket connection to the notification service
func (nc *NotificationClient) connect() {
	for {
		select {
		case <-nc.stopReconnect:
			return
		default:
			if err := nc.establishConnection(); err != nil {
				LogError("notification_client", "connection_failed", err)
				
				// Wait before retrying
				select {
				case <-nc.stopReconnect:
					return
				case <-time.After(5 * time.Second):
					continue
				}
			}
		}
	}
}

// establishConnection creates the WebSocket connection and handles messages
func (nc *NotificationClient) establishConnection() error {
	// Get notification service configuration
	notifyService, exists := services.GetService("notify")
	if !exists {
		return fmt.Errorf("notification service not configured")
	}
	
	// Build WebSocket URL for gateway endpoint
	wsURL := notifyService.URL_WS + "/ws/gateway"
	
	// Parse URL
	u, err := url.Parse(wsURL)
	if err != nil {
		return fmt.Errorf("invalid WebSocket URL: %w", err)
	}
	
	log.Printf("Connecting to notification service WebSocket: %s", wsURL)
	
	// Establish WebSocket connection
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		return fmt.Errorf("failed to connect to notification WebSocket: %w", err)
	}
	
	nc.conn = conn
	nc.reconnecting = false
	
	log.Println("Connected to notification service WebSocket")
	
	// Handle connection close
	defer func() {
		conn.Close()
		nc.conn = nil
		if !nc.reconnecting {
			log.Println("Notification WebSocket connection closed")
		}
	}()
	
	// Start ping/pong handler
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})
	
	// Send periodic pings
	pingTicker := time.NewTicker(30 * time.Second)
	defer pingTicker.Stop()
	
	go func() {
		for {
			select {
			case <-pingTicker.C:
				if nc.conn != nil {
					nc.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
					if err := nc.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
						LogError("notification_client", "ping_error", err)
						return
					}
				}
			case <-nc.stopReconnect:
				return
			}
		}
	}()
	
	// Listen for messages
	for {
		select {
		case <-nc.stopReconnect:
			return nil
		default:
			// Set read deadline
			conn.SetReadDeadline(time.Now().Add(60 * time.Second))
			
			_, message, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					LogError("notification_client", "read_error", err)
				}
				
				// Connection lost, trigger reconnection
				nc.reconnecting = true
				return fmt.Errorf("connection lost: %w", err)
			}
			
			// Process the notification message
			nc.processNotification(message)
		}
	}
}

// processNotification processes incoming notifications and forwards them to clients
func (nc *NotificationClient) processNotification(message []byte) {
	var notifMsg NotificationMessage
	if err := json.Unmarshal(message, &notifMsg); err != nil {
		LogError("notification_client", "unmarshal_error", err, "message:", string(message))
		return
	}
	
	log.Printf("Received notification message: %s", string(message))
	
	// Forward notification to the WebSocket manager based on message type
	if GlobalManager != nil {
		switch notifMsg.Type {
		case "notification_received", "notification":
			// Extract user ID from notification data
			if dataMap, ok := notifMsg.Data.(map[string]interface{}); ok {
				if userIDFloat, exists := dataMap["to_user_id"]; exists {
					var userID string
					switch v := userIDFloat.(type) {
					case float64:
						userID = fmt.Sprintf("%.0f", v)
					case string:
						userID = v
					default:
						userID = fmt.Sprintf("%v", v)
					}
					
					// Forward to specific user
					GlobalManager.SendToUser(userID, notifMsg.Type, notifMsg.Data)
					
					// Also send to notifications channel
					GlobalManager.SendToChannel("notifications", notifMsg.Type, notifMsg.Data, "")
					
					LogMessage("notification_client", "notification_forwarded", "user:", userID, "type:", notifMsg.Type)
				}
			}
		default:
			// Broadcast other message types
			GlobalManager.SendToChannel("notifications", notifMsg.Type, notifMsg.Data, "")
			LogMessage("notification_client", "message_broadcasted", "type:", notifMsg.Type)
		}
	} else {
		LogError("notification_client", "manager_not_initialized", fmt.Errorf("GlobalManager is nil"))
	}
}

// StopNotificationClient gracefully stops the notification client
func StopNotificationClient() {
	if notificationClient != nil {
		close(notificationClient.stopReconnect)
		if notificationClient.conn != nil {
			notificationClient.conn.Close()
		}
		log.Println("Notification client stopped")
	}
}

// IsNotificationClientConnected returns true if the client is connected
func IsNotificationClientConnected() bool {
	return notificationClient != nil && notificationClient.conn != nil && !notificationClient.reconnecting
}