package logger

import "time"

// DemoLogging demonstrates the centralized logging system
func DemoLogging() {
	// Test basic logging levels
	Info("Chat service initialized")
	Debug("This is a debug message (might not show depending on LOG_LEVEL)")
	Warn("This is a warning message")

	// Test contextual logging
	userCtx := WithComponent("demo").WithUser(123).WithAction("test_logging")
	InfoWithContext(userCtx, "User action logged with context")

	// Test message flow logging
	msgCtx := WithComponent("message_service").
		WithUser(501).
		WithConversation(42).
		WithMessage(1001).
		WithAction("send_message").
		WithDuration(25 * time.Millisecond)

	InfoWithContext(msgCtx, "Message sent successfully")

	// Test WebSocket logging
	wsCtx := WithComponent("websocket_hub").
		WithUser(502).
		WithAction("connection_established").
		WithExtra("total_connections", 15)

	InfoWithContext(wsCtx, "WebSocket connection established")

	// Test notification logging
	notifCtx := WithComponent("notification").
		WithUser(503).
		WithAction("push_sent").
		WithExtra("notification_type", "message").
		WithExtra("success_count", 3)

	InfoWithContext(notifCtx, "Push notifications sent to %d recipients", 3)
}