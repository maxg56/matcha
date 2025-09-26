package logger

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"runtime"
	"strings"
	"time"
)

// LogLevel represents the severity of a log message
type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARN
	ERROR
	FATAL
)

func (l LogLevel) String() string {
	return [...]string{"DEBUG", "INFO", "WARN", "ERROR", "FATAL"}[l]
}

// LogContext holds contextual information for logs
type LogContext struct {
	UserID         *uint              `json:"user_id,omitempty"`
	ConversationID *uint              `json:"conversation_id,omitempty"`
	MessageID      *uint              `json:"message_id,omitempty"`
	Action         string             `json:"action,omitempty"`
	Component      string             `json:"component,omitempty"`
	Duration       *time.Duration     `json:"duration,omitempty"`
	Extra          map[string]any     `json:"extra,omitempty"`
}

// Logger is the centralized logger for the chat service
type Logger struct {
	level      LogLevel
	jsonFormat bool
	service    string
}

var defaultLogger *Logger

func init() {
	defaultLogger = &Logger{
		level:      INFO,
		jsonFormat: os.Getenv("LOG_FORMAT") == "json",
		service:    "chat-service",
	}

	// Set log level from environment
	if lvl := os.Getenv("LOG_LEVEL"); lvl != "" {
		switch strings.ToUpper(lvl) {
		case "DEBUG":
			defaultLogger.level = DEBUG
		case "INFO":
			defaultLogger.level = INFO
		case "WARN":
			defaultLogger.level = WARN
		case "ERROR":
			defaultLogger.level = ERROR
		case "FATAL":
			defaultLogger.level = FATAL
		}
	}
}

// GetLogger returns the default logger instance
func GetLogger() *Logger {
	return defaultLogger
}

func (l *Logger) log(level LogLevel, msg string, ctx *LogContext, args ...any) {
	if level < l.level {
		return
	}

	timestamp := time.Now().UTC()

	if l.jsonFormat {
		l.logJSON(level, timestamp, msg, ctx, args...)
	} else {
		l.logText(level, timestamp, msg, ctx, args...)
	}
}

func (l *Logger) logJSON(level LogLevel, timestamp time.Time, msg string, ctx *LogContext, args ...any) {
	logEntry := map[string]any{
		"timestamp": timestamp.Format(time.RFC3339),
		"level":     level.String(),
		"service":   l.service,
		"message":   fmt.Sprintf(msg, args...),
	}

	// Add caller info for ERROR and FATAL
	if level >= ERROR {
		if _, file, line, ok := runtime.Caller(3); ok {
			logEntry["file"] = fmt.Sprintf("%s:%d", file, line)
		}
	}

	// Add context if provided
	if ctx != nil {
		if ctx.UserID != nil {
			logEntry["user_id"] = *ctx.UserID
		}
		if ctx.ConversationID != nil {
			logEntry["conversation_id"] = *ctx.ConversationID
		}
		if ctx.MessageID != nil {
			logEntry["message_id"] = *ctx.MessageID
		}
		if ctx.Action != "" {
			logEntry["action"] = ctx.Action
		}
		if ctx.Component != "" {
			logEntry["component"] = ctx.Component
		}
		if ctx.Duration != nil {
			logEntry["duration_ms"] = float64(ctx.Duration.Nanoseconds()) / 1e6
		}
		if ctx.Extra != nil {
			for k, v := range ctx.Extra {
				logEntry[k] = v
			}
		}
	}

	jsonData, _ := json.Marshal(logEntry)
	log.Println(string(jsonData))
}

func (l *Logger) logText(level LogLevel, timestamp time.Time, msg string, ctx *LogContext, args ...any) {
	formattedMsg := fmt.Sprintf(msg, args...)

	var contextParts []string
	if ctx != nil {
		if ctx.Component != "" {
			contextParts = append(contextParts, fmt.Sprintf("[%s]", ctx.Component))
		}
		if ctx.UserID != nil {
			contextParts = append(contextParts, fmt.Sprintf("[U:%d]", *ctx.UserID))
		}
		if ctx.ConversationID != nil {
			contextParts = append(contextParts, fmt.Sprintf("[C:%d]", *ctx.ConversationID))
		}
		if ctx.Action != "" {
			contextParts = append(contextParts, fmt.Sprintf("[%s]", ctx.Action))
		}
		if ctx.Duration != nil {
			contextParts = append(contextParts, fmt.Sprintf("[%.2fms]", float64(ctx.Duration.Nanoseconds())/1e6))
		}
	}

	contextStr := ""
	if len(contextParts) > 0 {
		contextStr = " " + strings.Join(contextParts, " ")
	}

	levelEmoji := map[LogLevel]string{
		DEBUG: "🐛",
		INFO:  "ℹ️",
		WARN:  "⚠️",
		ERROR: "❌",
		FATAL: "💀",
	}

	log.Printf("%s [%s]%s %s", levelEmoji[level], level.String(), contextStr, formattedMsg)
}

// Context helper functions
func WithUser(userID uint) *LogContext {
	return &LogContext{UserID: &userID}
}

func WithConversation(conversationID uint) *LogContext {
	return &LogContext{ConversationID: &conversationID}
}

func WithMessage(messageID uint) *LogContext {
	return &LogContext{MessageID: &messageID}
}

func WithAction(action string) *LogContext {
	return &LogContext{Action: action}
}

func WithComponent(component string) *LogContext {
	return &LogContext{Component: component}
}

func WithDuration(duration time.Duration) *LogContext {
	return &LogContext{Duration: &duration}
}

func WithExtra(key string, value any) *LogContext {
	return &LogContext{Extra: map[string]any{key: value}}
}

// Chain context builders
func (ctx *LogContext) WithUser(userID uint) *LogContext {
	ctx.UserID = &userID
	return ctx
}

func (ctx *LogContext) WithConversation(conversationID uint) *LogContext {
	ctx.ConversationID = &conversationID
	return ctx
}

func (ctx *LogContext) WithMessage(messageID uint) *LogContext {
	ctx.MessageID = &messageID
	return ctx
}

func (ctx *LogContext) WithAction(action string) *LogContext {
	ctx.Action = action
	return ctx
}

func (ctx *LogContext) WithComponent(component string) *LogContext {
	ctx.Component = component
	return ctx
}

func (ctx *LogContext) WithDuration(duration time.Duration) *LogContext {
	ctx.Duration = &duration
	return ctx
}

func (ctx *LogContext) WithExtra(key string, value any) *LogContext {
	if ctx.Extra == nil {
		ctx.Extra = make(map[string]any)
	}
	ctx.Extra[key] = value
	return ctx
}

// Public logging functions
func Debug(msg string, args ...any) {
	defaultLogger.log(DEBUG, msg, nil, args...)
}

func DebugWithContext(ctx *LogContext, msg string, args ...any) {
	defaultLogger.log(DEBUG, msg, ctx, args...)
}

func Info(msg string, args ...any) {
	defaultLogger.log(INFO, msg, nil, args...)
}

func InfoWithContext(ctx *LogContext, msg string, args ...any) {
	defaultLogger.log(INFO, msg, ctx, args...)
}

func Warn(msg string, args ...any) {
	defaultLogger.log(WARN, msg, nil, args...)
}

func WarnWithContext(ctx *LogContext, msg string, args ...any) {
	defaultLogger.log(WARN, msg, ctx, args...)
}

func Error(msg string, args ...any) {
	defaultLogger.log(ERROR, msg, nil, args...)
}

func ErrorWithContext(ctx *LogContext, msg string, args ...any) {
	defaultLogger.log(ERROR, msg, ctx, args...)
}

func Fatal(msg string, args ...any) {
	defaultLogger.log(FATAL, msg, nil, args...)
	os.Exit(1)
}

func FatalWithContext(ctx *LogContext, msg string, args ...any) {
	defaultLogger.log(FATAL, msg, ctx, args...)
	os.Exit(1)
}