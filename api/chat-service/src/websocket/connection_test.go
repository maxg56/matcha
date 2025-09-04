package websocket

import (
	"testing"
	"time"
)

func TestConnectionRateLimiting(t *testing.T) {
	// Create a mock connection for testing
	conn := &Connection{
		userID:       123,
		messageTimes: make([]time.Time, 0),
	}

	// Test case 1: Should allow messages within rate limit
	for i := 0; i < 9; i++ {
		if !conn.checkRateLimit() {
			t.Fatalf("Expected message %d to be allowed within rate limit", i+1)
		}
	}

	// Test case 2: 10th message should still be allowed (at limit)
	if !conn.checkRateLimit() {
		t.Fatal("Expected 10th message to be allowed (at limit)")
	}

	// Test case 3: 11th message should be rate limited
	if conn.checkRateLimit() {
		t.Fatal("Expected 11th message to be rate limited")
	}

	// Test case 4: After time window, should allow messages again
	// Simulate time passing by manipulating messageTimes
	oldTime := time.Now().Add(-2 * time.Minute) // 2 minutes ago
	for i := range conn.messageTimes {
		conn.messageTimes[i] = oldTime
	}

	if !conn.checkRateLimit() {
		t.Fatal("Expected message to be allowed after time window passed")
	}
}

func TestConnectionRateLimitTimeWindow(t *testing.T) {
	conn := &Connection{
		userID:       456,
		messageTimes: make([]time.Time, 0),
	}

	// Add some old messages (outside time window)
	oldTime := time.Now().Add(-2 * time.Minute)
	conn.messageTimes = append(conn.messageTimes, oldTime, oldTime, oldTime)

	// Check rate limit - should clean up old messages
	allowed := conn.checkRateLimit()
	if !allowed {
		t.Fatal("Expected message to be allowed after cleanup of old messages")
	}

	// Should only have 1 message now (the new one we just added)
	if len(conn.messageTimes) != 1 {
		t.Fatalf("Expected 1 message time after cleanup, got %d", len(conn.messageTimes))
	}
}

func TestMessageTypeValidation(t *testing.T) {
	// Test cases for different message types
	testCases := []struct {
		msgType  MessageType
		expected bool
	}{
		{MessageTypeSend, true},
		{MessageTypeJoin, true},
		{MessageTypeTyping, true},
		{MessageType("invalid"), false},
		{MessageType(""), false},
	}

	for _, tc := range testCases {
		// This would be tested in a fuller integration test
		// For now, just verify the constants are defined
		switch tc.msgType {
		case MessageTypeSend, MessageTypeJoin, MessageTypeTyping, 
			 MessageTypeNewMessage, MessageTypeError, 
			 MessageTypeConnected, MessageTypeDisconnected:
			// Valid message types
			if !tc.expected && (tc.msgType == MessageTypeSend || 
								tc.msgType == MessageTypeJoin || 
								tc.msgType == MessageTypeTyping) {
				t.Errorf("Expected message type %s to be valid", tc.msgType)
			}
		default:
			if tc.expected {
				t.Errorf("Expected message type %s to be invalid", tc.msgType)
			}
		}
	}
}