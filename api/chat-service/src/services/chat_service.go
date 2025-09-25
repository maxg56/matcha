package services

import (
	"chat-service/src/models"
	"chat-service/src/types"
	"errors"
)

type chatService struct {
	repo      types.ChatRepository
	publisher types.MessagePublisher
	connMgr   types.ConnectionManager
}

func NewChatService(
	repo types.ChatRepository,
	publisher types.MessagePublisher,
	connMgr types.ConnectionManager,
) types.ChatService {
	return &chatService{
		repo:      repo,
		publisher: publisher,
		connMgr:   connMgr,
	}
}

// Conversation methods
func (s *chatService) GetUserConversations(userID uint) ([]models.Discussion, error) {
	return s.repo.GetUserConversations(userID)
}

func (s *chatService) GetConversation(userID, conversationID uint) (*models.Discussion, error) {
	// Verify user has access
	hasAccess, err := s.repo.IsUserInConversation(userID, conversationID)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		// Check if conversation exists at all
		_, err := s.repo.GetConversation(conversationID)
		if err != nil {
			return nil, errors.New("conversation not found")
		}
		return nil, errors.New("access denied")
	}

	return s.repo.GetConversation(conversationID)
}

func (s *chatService) CreateConversation(user1ID, user2ID uint) (*models.Discussion, error) {
	if user1ID == user2ID {
		return nil, errors.New("cannot create conversation with yourself")
	}
	
	return s.repo.CreateConversation(user1ID, user2ID)
}

// Message methods
func (s *chatService) GetMessages(userID, conversationID uint, limit, offset int) ([]models.Message, error) {
	// Verify access
	hasAccess, err := s.repo.IsUserInConversation(userID, conversationID)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		// Check if conversation exists at all
		_, err := s.repo.GetConversation(conversationID)
		if err != nil {
			return nil, errors.New("conversation not found")
		}
		return nil, errors.New("access denied")
	}
	
	// Set default pagination
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}
	
	return s.repo.GetMessages(conversationID, limit, offset)
}

func (s *chatService) SendMessage(senderID, conversationID uint, content string) (*models.Message, error) {
	// Verify access
	hasAccess, err := s.repo.IsUserInConversation(senderID, conversationID)
	if err != nil {
		return nil, err
	}
	if !hasAccess {
		// Check if conversation exists at all
		_, err := s.repo.GetConversation(conversationID)
		if err != nil {
			return nil, errors.New("conversation not found")
		}
		return nil, errors.New("access denied")
	}
	
	// Validate message
	if content == "" {
		return nil, errors.New("message cannot be empty")
	}
	if len(content) > 1000 {
		return nil, errors.New("message too long")
	}
	
	// Save message
	message, err := s.repo.SaveMessage(senderID, conversationID, content)
	if err != nil {
		return nil, err
	}
	
	// Broadcast to participants
	go s.BroadcastMessage(*message)
	
	return message, nil
}

func (s *chatService) MarkMessagesAsRead(userID, conversationID uint) error {
	// Verify access
	hasAccess, err := s.repo.IsUserInConversation(userID, conversationID)
	if err != nil {
		return err
	}
	if !hasAccess {
		// Check if conversation exists at all
		_, err := s.repo.GetConversation(conversationID)
		if err != nil {
			return errors.New("conversation not found")
		}
		return errors.New("access denied")
	}
	
	return s.repo.MarkMessagesAsRead(conversationID, userID)
}

// Real-time methods
func (s *chatService) HandleConnection(userID uint, conn types.WebSocketConnection) error {
	return s.connMgr.AddConnection(userID, conn)
}

func (s *chatService) BroadcastMessage(message models.Message) error {
	participants, err := s.repo.GetConversationParticipants(message.ConvID)
	if err != nil {
		return err
	}
	
	return s.publisher.PublishMessage(message, participants)
}