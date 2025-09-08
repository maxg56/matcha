package websocket

import (
	"log"
	"time"
)

// LogLevel represents different logging levels
type LogLevel int

const (
	LogLevelDebug LogLevel = iota
	LogLevelInfo
	LogLevelWarn
	LogLevelError
)

// WSLogger provides structured logging for WebSocket operations
type WSLogger struct {
	level LogLevel
}

var logger = &WSLogger{level: LogLevelInfo}

// SetLogLevel sets the global log level for WebSocket operations
func SetLogLevel(level LogLevel) {
	logger.level = level
}

// Debug logs debug messages
func (l *WSLogger) Debug(userID, operation string, details ...any) {
	if l.level <= LogLevelDebug {
		log.Printf("[DEBUG] [WS] [%s] [%s] %v", userID, operation, details)
	}
}

// Info logs info messages
func (l *WSLogger) Info(userID, operation string, details ...any) {
	if l.level <= LogLevelInfo {
		log.Printf("[INFO] [WS] [%s] [%s] %v", userID, operation, details)
	}
}

// Warn logs warning messages
func (l *WSLogger) Warn(userID, operation string, details ...any) {
	if l.level <= LogLevelWarn {
		log.Printf("[WARN] [WS] [%s] [%s] %v", userID, operation, details)
	}
}

// Error logs error messages
func (l *WSLogger) Error(userID, operation string, details ...any) {
	if l.level <= LogLevelError {
		log.Printf("[ERROR] [WS] [%s] [%s] %v", userID, operation, details)
	}
}

// LogConnection logs connection events
func LogConnection(userID, event string, details ...any) {
	logger.Info(userID, "connection_"+event, details...)
}

// LogMessage logs message events
func LogMessage(userID, messageType string, details ...any) {
	logger.Debug(userID, "message_"+messageType, details...)
}

// LogError logs error events
func LogError(userID, errorType string, err error, details ...any) {
	allDetails := append([]any{err}, details...)
	logger.Error(userID, "error_"+errorType, allDetails...)
}

// LogSubscription logs subscription events
func LogSubscription(userID, channel, action string) {
	logger.Info(userID, "subscription_"+action, "channel:", channel)
}

// LogBroadcast logs broadcast events
func LogBroadcast(channel, messageType string, recipientCount int) {
	logger.Debug("system", "broadcast", 
		"channel:", channel, 
		"type:", messageType, 
		"recipients:", recipientCount)
}

// LogPerformance logs performance metrics
func LogPerformance(operation string, duration time.Duration, details ...any) {
	allDetails := append([]any{"duration:", duration}, details...)
	logger.Info("system", "performance_"+operation, allDetails...)
}