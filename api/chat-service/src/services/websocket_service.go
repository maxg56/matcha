package services

import (
	"chat-service/src/conf"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WebSocketService struct {
	clients    map[uint]*websocket.Conn
	clientsMux sync.RWMutex
	pubsub     *redis.PubSub
}

type WSMessage struct {
	Type           string                 `json:"type"`
	ConversationID uint                   `json:"conversation_id,omitempty"`
	Content        string                 `json:"content,omitempty"`
	Data           map[string]interface{} `json:"data,omitempty"`
}

func NewWebSocketService() *WebSocketService {
	return &WebSocketService{
		clients: make(map[uint]*websocket.Conn),
	}
}

func (ws *WebSocketService) HandleConnection(c *gin.Context) {
	userIDStr := c.GetHeader("X-User-ID")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	ws.AddClient(uint(userID), conn)
	defer ws.RemoveClient(uint(userID))

	ws.startListeningForMessages(uint(userID))

	for {
		var message WSMessage
		err := conn.ReadJSON(&message)
		if err != nil {
			log.Printf("WebSocket read error for user %d: %v", userID, err)
			break
		}

		err = ws.handleMessage(uint(userID), message)
		if err != nil {
			log.Printf("Error handling message from user %d: %v", userID, err)
			ws.sendError(conn, "Failed to process message")
		}
	}
}

func (ws *WebSocketService) AddClient(userID uint, conn *websocket.Conn) {
	ws.clientsMux.Lock()
	defer ws.clientsMux.Unlock()

	if existingConn, exists := ws.clients[userID]; exists {
		existingConn.Close()
	}

	ws.clients[userID] = conn
	log.Printf("Client %d connected", userID)
}

func (ws *WebSocketService) RemoveClient(userID uint) {
	ws.clientsMux.Lock()
	defer ws.clientsMux.Unlock()

	if conn, exists := ws.clients[userID]; exists {
		conn.Close()
		delete(ws.clients, userID)
		log.Printf("Client %d disconnected", userID)
	}
}

func (ws *WebSocketService) startListeningForMessages(userID uint) {
	channel := fmt.Sprintf("user:%d", userID)
	pubsub := conf.RedisClient.Subscribe(conf.Ctx, channel)

	go func() {
		defer pubsub.Close()

		for {
			msg, err := pubsub.ReceiveMessage(conf.Ctx)
			if err != nil {
				log.Printf("Redis subscription error for user %d: %v", userID, err)
				return
			}

			var event MessageEvent
			err = json.Unmarshal([]byte(msg.Payload), &event)
			if err != nil {
				log.Printf("Failed to unmarshal message event: %v", err)
				continue
			}

			ws.sendMessageToClient(userID, event)
		}
	}()
}

func (ws *WebSocketService) sendMessageToClient(userID uint, event MessageEvent) {
	ws.clientsMux.RLock()
	conn, exists := ws.clients[userID]
	ws.clientsMux.RUnlock()

	if !exists {
		return
	}

	wsMessage := WSMessage{
		Type:           event.Type,
		ConversationID: event.ConversationID,
		Data: map[string]interface{}{
			"message":     event.Message,
			"timestamp":   event.Timestamp,
			"participants": event.Participants,
		},
	}

	err := conn.WriteJSON(wsMessage)
	if err != nil {
		log.Printf("Failed to send message to client %d: %v", userID, err)
		ws.RemoveClient(userID)
	}
}

func (ws *WebSocketService) handleMessage(userID uint, message WSMessage) error {
	switch message.Type {
	case "send_message":
		return ws.handleSendMessage(userID, message)
	case "join_conversation":
		return ws.handleJoinConversation(userID, message)
	case "typing":
		return ws.handleTyping(userID, message)
	default:
		return fmt.Errorf("unknown message type: %s", message.Type)
	}
}

func (ws *WebSocketService) handleSendMessage(userID uint, message WSMessage) error {
	if message.ConversationID == 0 || message.Content == "" {
		return fmt.Errorf("conversation_id and content are required")
	}

	convService := NewConversationService()
	isParticipant, err := convService.IsUserInConversation(userID, message.ConversationID)
	if err != nil {
		return fmt.Errorf("failed to verify conversation membership: %w", err)
	}

	if !isParticipant {
		return fmt.Errorf("user not authorized for this conversation")
	}

	msgService := NewMessageService()
	savedMessage, err := msgService.SaveMessage(userID, message.ConversationID, message.Content)
	if err != nil {
		return fmt.Errorf("failed to save message: %w", err)
	}

	participants, err := convService.GetConversationParticipants(message.ConversationID)
	if err != nil {
		return fmt.Errorf("failed to get participants: %w", err)
	}

	return msgService.PublishMessage(*savedMessage, participants)
}

func (ws *WebSocketService) handleJoinConversation(userID uint, message WSMessage) error {
	if message.ConversationID == 0 {
		return fmt.Errorf("conversation_id is required")
	}

	convService := NewConversationService()
	isParticipant, err := convService.IsUserInConversation(userID, message.ConversationID)
	if err != nil {
		return fmt.Errorf("failed to verify conversation membership: %w", err)
	}

	if !isParticipant {
		return fmt.Errorf("user not authorized for this conversation")
	}

	msgService := NewMessageService()
	err = msgService.MarkMessagesAsRead(message.ConversationID, userID)
	if err != nil {
		log.Printf("Failed to mark messages as read: %v", err)
	}

	return nil
}

func (ws *WebSocketService) handleTyping(userID uint, message WSMessage) error {
	if message.ConversationID == 0 {
		return fmt.Errorf("conversation_id is required")
	}

	convService := NewConversationService()
	participants, err := convService.GetConversationParticipants(message.ConversationID)
	if err != nil {
		return fmt.Errorf("failed to get participants: %w", err)
	}

	event := MessageEvent{
		Type:           "typing",
		ConversationID: message.ConversationID,
		Participants:   participants,
		Timestamp:      time.Now(),
		Data: map[string]interface{}{
			"user_id": userID,
		},
	}

	eventJSON, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal typing event: %w", err)
	}

	channel := fmt.Sprintf("conversation:%d", message.ConversationID)
	return conf.RedisClient.Publish(conf.Ctx, channel, eventJSON).Err()
}

func (ws *WebSocketService) sendError(conn *websocket.Conn, message string) {
	wsMessage := WSMessage{
		Type: "error",
		Data: map[string]interface{}{
			"message": message,
		},
	}

	err := conn.WriteJSON(wsMessage)
	if err != nil {
		log.Printf("Failed to send error message: %v", err)
	}
}