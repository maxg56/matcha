package websocket

import "errors"

// WebSocket specific errors
var (
	ErrUnknownMessageType   = errors.New("unknown message type")
	ErrInvalidMessage       = errors.New("invalid message format")
	ErrInvalidConversation  = errors.New("invalid conversation ID")
	ErrUnauthorized         = errors.New("user not authorized")
	ErrConnectionClosed     = errors.New("connection closed")
	ErrMessageTooLarge      = errors.New("message too large")
	ErrRateLimited          = errors.New("rate limited")
)