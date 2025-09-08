package websocket

// MessageType represents the type of WebSocket message
type MessageType string

const (
	// Client to server message types
	MessageTypeChat          MessageType = "chat"
	MessageTypeNotification  MessageType = "notification"
	MessageTypeSubscribe     MessageType = "subscribe"
	MessageTypeUnsubscribe   MessageType = "unsubscribe"
	MessageTypePing          MessageType = "ping"
	
	// Server to client message types
	MessageTypeChatMessage    MessageType = "chat_message"
	MessageTypeChatAck        MessageType = "chat_ack"
	MessageTypeNotificationRead MessageType = "notification_marked_read"
	MessageTypeAllNotificationRead MessageType = "all_notifications_marked_read"
	MessageTypeSubscriptionAck   MessageType = "subscription_ack"
	MessageTypeUnsubscriptionAck MessageType = "unsubscription_ack"
	MessageTypePong             MessageType = "pong"
	MessageTypeConnectionAck    MessageType = "connection_ack"
	MessageTypeError           MessageType = "error"
)

// ChannelType represents predefined channel types
type ChannelType string

const (
	ChannelTypeNotifications ChannelType = "notifications"
	ChannelTypeChat         ChannelType = "chat"
	ChannelTypeUserUpdates  ChannelType = "user-updates"
)

// ChatMessageData represents the data structure for chat messages
type ChatMessageData struct {
	ConversationID string `json:"conversation_id"`
	Message        string `json:"message"`
	FromUser       string `json:"from_user,omitempty"`
	Timestamp      int64  `json:"timestamp,omitempty"`
	Type           string `json:"type,omitempty"`
}

// NotificationActionData represents notification action data
type NotificationActionData struct {
	Action         string `json:"action"`
	NotificationID string `json:"notification_id,omitempty"`
}

// ErrorData represents error message data
type ErrorData struct {
	ErrorType string `json:"error_type"`
	Message   string `json:"message"`
	Timestamp int64  `json:"timestamp"`
}

// ConnectionStatus represents client connection status
type ConnectionStatus string

const (
	ConnectionStatusConnected    ConnectionStatus = "connected"
	ConnectionStatusDisconnected ConnectionStatus = "disconnected"
	ConnectionStatusReconnecting ConnectionStatus = "reconnecting"
)