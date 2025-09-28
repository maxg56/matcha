package services

import (
	"chat-service/src/models"
	"chat-service/src/types"
	"errors"
)

type chatService struct {
	repo            types.ChatRepository
	connMgr         types.ConnectionManager
	messageService  *MessageService
	notificationSvc *NotificationService
}

func NewChatService(
	repo types.ChatRepository,
	connMgr types.ConnectionManager,
) types.ChatService {
	return &chatService{
		repo:            repo,
		connMgr:         connMgr,
		messageService:  NewMessageService(),
		notificationSvc: NewNotificationService(),
	}
}

// Conversation methods
func (s *chatService) GetUserConversations(userID uint) (*types.ConversationListResponse, error) {
	// Get raw conversations
	discussions, err := s.repo.GetUserConversations(userID)
	if err != nil {
		return nil, err
	}

	if len(discussions) == 0 {
		return &types.ConversationListResponse{
			Conversations: []types.ConversationResponse{},
			HasMore:       false,
			Total:         0,
		}, nil
	}

	// Collect unique user IDs we need info for (excluding current user)
	userIDsNeeded := make(map[uint]bool)
	for _, discussion := range discussions {
		if discussion.User1ID != userID {
			userIDsNeeded[discussion.User1ID] = true
		}
		if discussion.User2ID != userID {
			userIDsNeeded[discussion.User2ID] = true
		}
	}

	// Convert map to slice
	userIDs := make([]uint, 0, len(userIDsNeeded))
	for id := range userIDsNeeded {
		userIDs = append(userIDs, id)
	}

	// Get user info for all other users
	usersInfo, err := s.repo.GetUsersInfo(userIDs)
	if err != nil {
		return nil, err
	}

	// Enrich conversations
	enrichedConversations := make([]types.ConversationResponse, len(discussions))
	for i, discussion := range discussions {
		// Determine who is the "other" user
		var otherUserID uint
		if discussion.User1ID == userID {
			otherUserID = discussion.User2ID
		} else {
			otherUserID = discussion.User1ID
		}

		// Get other user info
		otherUser := usersInfo[otherUserID]
		if otherUser == nil {
			// Fallback if user info not found
			otherUser = &types.UserInfo{
				ID:       otherUserID,
				Username: "Unknown",
				Avatar:   "",
			}
		}

		// Get unread count for this user and conversation
		unreadCount, err := s.repo.GetUnreadCount(discussion.ID, userID)
		if err != nil {
			// Don't fail the whole request if unread count fails
			unreadCount = 0
		}

		enrichedConversations[i] = types.ConversationResponse{
			ID:            discussion.ID,
			User1ID:       discussion.User1ID,
			User2ID:       discussion.User2ID,
			LastMessage:   discussion.LastMessageContent, // Map field name
			LastMessageAt: discussion.LastMessageAt,
			UnreadCount:   unreadCount,
			OtherUser:     otherUser,
			CreatedAt:     discussion.CreatedAt,
		}
	}

	return &types.ConversationListResponse{
		Conversations: enrichedConversations,
		HasMore:       false, // TODO: Implement pagination
		Total:         int64(len(enrichedConversations)),
	}, nil
}

func (s *chatService) GetConversation(userID, conversationID uint) (*types.ConversationResponse, error) {
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

	discussion, err := s.repo.GetConversation(conversationID)
	if err != nil {
		return nil, err
	}

	// Determine other user and get their info
	var otherUserID uint
	if discussion.User1ID == userID {
		otherUserID = discussion.User2ID
	} else {
		otherUserID = discussion.User1ID
	}

	otherUser, err := s.repo.GetUserInfo(otherUserID)
	if err != nil {
		// Fallback if user info not found
		otherUser = &types.UserInfo{
			ID:       otherUserID,
			Username: "Unknown",
			Avatar:   "",
		}
	}

	// Get unread count
	unreadCount, err := s.repo.GetUnreadCount(conversationID, userID)
	if err != nil {
		unreadCount = 0
	}

	return &types.ConversationResponse{
		ID:            discussion.ID,
		User1ID:       discussion.User1ID,
		User2ID:       discussion.User2ID,
		LastMessage:   discussion.LastMessageContent,
		LastMessageAt: discussion.LastMessageAt,
		UnreadCount:   unreadCount,
		OtherUser:     otherUser,
		CreatedAt:     discussion.CreatedAt,
	}, nil
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

	messages, err := s.repo.GetMessages(conversationID, limit, offset)
	if err != nil {
		return nil, err
	}

	// Enrich messages with reactions
	for i := range messages {
		reactions, err := s.repo.GetMessageReactions(messages[i].ID)
		if err != nil {
			// Don't fail the whole request if reactions fail
			reactions = []models.MessageReaction{}
		}
		messages[i].Reactions = reactions
	}

	return messages, nil
}

func (s *chatService) GetMessage(messageID uint) (*models.Message, error) {
	return s.repo.GetMessage(messageID)
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
	
	// Save message using the message service
	message, err := s.messageService.SaveMessage(senderID, conversationID, content)
	if err != nil {
		return nil, err
	}

	// Send notifications using the notification service
	participants, err := s.repo.GetConversationParticipants(conversationID)
	if err == nil {
		// Don't fail the message send if notifications fail
		_ = s.notificationSvc.PublishMessage(*message, participants)
	}

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

	return s.notificationSvc.PublishMessage(message, participants)
}

// Reaction methods
func (s *chatService) AddReaction(userID, messageID uint, emoji string) (*models.MessageReaction, error) {
	// For now, we'll allow reactions without strict conversation access check
	// In production, you should verify the user is in the conversation

	reaction, err := s.repo.AddReaction(messageID, userID, emoji)
	if err != nil {
		// Check if this was a toggle operation (reaction removal)
		if err.Error() == "reaction_removed" {
			// The reaction was removed (toggle), return a special indicator
			return nil, errors.New("reaction_removed")
		}
		return nil, err
	}

	// Broadcast reaction to conversation participants
	// This would be implemented with WebSocket updates

	return reaction, nil
}

func (s *chatService) RemoveReaction(userID, messageID uint, emoji string) error {
	// Verify user has access to the message's conversation (simplified for now)

	err := s.repo.RemoveReaction(messageID, userID, emoji)
	if err != nil {
		return err
	}

	// Broadcast reaction removal to conversation participants
	// This would be implemented with WebSocket updates

	return nil
}

func (s *chatService) GetMessageReactions(userID, messageID uint) ([]models.MessageReaction, error) {
	// Verify user has access to the message's conversation (simplified for now)

	return s.repo.GetMessageReactions(messageID)
}

// User presence methods
func (s *chatService) SetUserOnline(userID uint) error {
	err := s.repo.UpdateUserPresence(userID, true)
	if err != nil {
		return err
	}

	// Notify relevant users about online status
	// This could be friends, conversation participants, etc.
	// For now we'll broadcast to all connected users
	// s.connMgr.BroadcastToUsers(relevantUsers, OnlineStatusMessage{...})

	return nil
}

func (s *chatService) SetUserOffline(userID uint) error {
	err := s.repo.SetUserOffline(userID)
	if err != nil {
		return err
	}

	// Notify relevant users about offline status
	// This could be friends, conversation participants, etc.

	return nil
}

func (s *chatService) GetUserPresence(userID uint) (*models.UserPresence, error) {
	return s.repo.GetUserPresence(userID)
}