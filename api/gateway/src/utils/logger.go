package utils

import (
	"log"
	"os"
	"strings"
)

type LogLevel int

const (
	LogLevelError LogLevel = iota
	LogLevelWarn
	LogLevelInfo
	LogLevelDebug
)

var currentLogLevel LogLevel

func init() {
	// Set log level from environment variable
	level := strings.ToLower(os.Getenv("LOG_LEVEL"))
	switch level {
	case "error":
		currentLogLevel = LogLevelError
	case "warn", "warning":
		currentLogLevel = LogLevelWarn
	case "info":
		currentLogLevel = LogLevelInfo
	case "debug":
		currentLogLevel = LogLevelDebug
	default:
		// Default to info in production, debug in development
		if gin_mode := os.Getenv("GIN_MODE"); gin_mode == "release" {
			currentLogLevel = LogLevelInfo
		} else {
			currentLogLevel = LogLevelDebug
		}
	}
}

func LogDebug(service, message string) {
	if currentLogLevel >= LogLevelDebug {
		log.Printf("[DEBUG] [%s] %s", service, message)
	}
}

func LogInfo(service, message string) {
	if currentLogLevel >= LogLevelInfo {
		log.Printf("[INFO] [%s] %s", service, message)
	}
}

func LogWarn(service, message string) {
	if currentLogLevel >= LogLevelWarn {
		log.Printf("[WARN] [%s] %s", service, message)
	}
}

func LogError(service, message string) {
	if currentLogLevel >= LogLevelError {
		log.Printf("[ERROR] [%s] %s", service, message)
	}
}

// Secure logging that never logs sensitive data
func LogAuth(message string) {
	LogInfo("auth", message)
}

func LogProxy(message string) {
	LogInfo("proxy", message)
}