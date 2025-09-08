package websocket

import (
	"chat-service/src/models"
	"testing"
	"time"
)

// Mock ChatRepository for testing
type mockChatRepository struct {
	participants map[uint][]uint
}

func (m *mockChatRepository) GetConversationParticipants(conversationID uint) ([]uint, error) {
	if participants, exists := m.participants[conversationID]; exists {
		return participants, nil
	}
	return []uint{}, nil
}

// Implement other required methods as no-ops for testing
func (m *mockChatRepository) GetUserConversations(userID uint) ([]models.Discussion, error) {
	return []models.Discussion{}, nil
}

func (m *mockChatRepository) GetConversation(conversationID uint) (*models.Discussion, error) {
	return &models.Discussion{ID: conversationID, User1ID: 1, User2ID: 2}, nil
}

func (m *mockChatRepository) CreateConversation(user1ID, user2ID uint) (*models.Discussion, error) {
	return &models.Discussion{ID: 1, User1ID: user1ID, User2ID: user2ID}, nil
}

func (m *mockChatRepository) FindConversationBetweenUsers(user1ID, user2ID uint) (*models.Discussion, error) {
	return &models.Discussion{ID: 1, User1ID: user1ID, User2ID: user2ID}, nil
}

func (m *mockChatRepository) IsUserInConversation(userID, conversationID uint) (bool, error) {
	return true, nil
}

func (m *mockChatRepository) UpdateLastMessage(conversationID uint, content string) error {
	return nil
}

func (m *mockChatRepository) GetMessages(conversationID uint, limit, offset int) ([]models.Message, error) {
	return []models.Message{}, nil
}

func (m *mockChatRepository) SaveMessage(senderID, conversationID uint, content string) (*models.Message, error) {
	return &models.Message{ID: 1, SenderID: senderID, ConvID: conversationID, Msg: content}, nil
}

func (m *mockChatRepository) MarkMessagesAsRead(conversationID, userID uint) error {
	return nil
}

func (m *mockChatRepository) GetUnreadCount(conversationID, userID uint) (int64, error) {
	return 0, nil
}

func TestHubGetConversationParticipants(t *testing.T) {
	// Setup mock repository
	mockRepo := &mockChatRepository{
		participants: map[uint][]uint{
			1: {100, 200}, // Conversation 1 has users 100 and 200
			2: {200, 300}, // Conversation 2 has users 200 and 300
		},
	}

	// Create hub with mock repository
	hub := NewHub(nil, mockRepo)

	// Test case 1: Valid conversation with participants
	participants, err := hub.getConversationParticipants(1)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	if len(participants) != 2 {
		t.Fatalf("Expected 2 participants, got %d", len(participants))
	}
	if participants[0] != 100 || participants[1] != 200 {
		t.Fatalf("Expected participants [100, 200], got %v", participants)
	}

	// Test case 2: Non-existent conversation
	participants, err = hub.getConversationParticipants(999)
	if err != nil {
		t.Fatalf("Expected no error for non-existent conversation, got %v", err)
	}
	if len(participants) != 0 {
		t.Fatalf("Expected 0 participants for non-existent conversation, got %d", len(participants))
	}
}

func TestHubConnectionManagement(t *testing.T) {
	mockRepo := &mockChatRepository{participants: make(map[uint][]uint)}
	hub := NewHub(nil, mockRepo)

	// Test user online status
	if hub.IsUserOnline(123) {
		t.Error("Expected user 123 to be offline initially")
	}

	// Test get connected users (should be empty)
	users := hub.GetConnectedUsers()
	if len(users) != 0 {
		t.Errorf("Expected 0 connected users initially, got %d", len(users))
	}
}

func TestHubBroadcastMessage(t *testing.T) {
	mockRepo := &mockChatRepository{
		participants: map[uint][]uint{
			1: {100, 200},
		},
	}

	hub := NewHub(nil, mockRepo)
	go hub.Run() // Start hub in background

	// Give hub time to start
	time.Sleep(10 * time.Millisecond)

	// Test broadcast to conversation
	msg := OutgoingMessage{
		Type: MessageTypeNewMessage,
		Data: MessageData{ID: 1, Message: "Test message"},
		Timestamp: time.Now(),
	}

	// This should not panic or error, even with no connected users
	hub.BroadcastToConversation(1, msg, 100)

	// Test broadcast to specific user
	hub.BroadcastToUser(200, msg)
}