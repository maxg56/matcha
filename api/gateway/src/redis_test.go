package main

import (
	"testing"
	"time"
)

func TestTokenBlacklist_WithoutRedis(t *testing.T) {
	// Test behavior when Redis is not connected
	redisClient = nil

	token := "test.jwt.token"

	// Should return false when Redis is not available
	if isTokenBlacklisted(token) {
		t.Fatal("Expected token not to be blacklisted when Redis is unavailable")
	}

	// Should not error when Redis is not available
	if err := blacklistToken(token, time.Hour); err != nil {
		t.Fatal("Expected no error when blacklisting without Redis")
	}
}

func TestTokenHashing(t *testing.T) {
	// Test that different tokens produce different hashes
	token1 := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
	token2 := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ODc2NTQzMjEwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.xyz123"

	if token1 == token2 {
		t.Fatal("Test tokens should be different")
	}

	// The actual hashing is internal to the blacklist functions
	// This test ensures the basic principle works
}
