package repository

import (
	"chat-service/src/models"
	"chat-service/src/types"
	"time"
	
	"gorm.io/gorm"
)

type chatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) types.ChatRepository {
	return &chatRepository{db: db}
}

// Conversation operations
func (r *chatRepository) GetUserConversations(userID uint) ([]models.Discussion, error) {
	var conversations []models.Discussion
	
	err := r.db.Where("user1_id = ? OR user2_id = ?", userID, userID).
		Order("last_message_at DESC NULLS LAST, created_at DESC").
		Find(&conversations).Error
	
	return conversations, err
}

func (r *chatRepository) GetConversation(conversationID uint) (*models.Discussion, error) {
	var conversation models.Discussion
	
	err := r.db.First(&conversation, conversationID).Error
	if err != nil {
		return nil, err
	}
	
	return &conversation, nil
}

func (r *chatRepository) CreateConversation(user1ID, user2ID uint) (*models.Discussion, error) {
	// Check if conversation already exists
	existing, err := r.FindConversationBetweenUsers(user1ID, user2ID)
	if err == nil {
		return existing, nil
	}
	
	conversation := &models.Discussion{
		User1ID: user1ID,
		User2ID: user2ID,
	}
	
	err = r.db.Create(conversation).Error
	return conversation, err
}

func (r *chatRepository) FindConversationBetweenUsers(user1ID, user2ID uint) (*models.Discussion, error) {
	var conversation models.Discussion
	
	err := r.db.Where(
		"(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
		user1ID, user2ID, user2ID, user1ID,
	).First(&conversation).Error
	
	return &conversation, err
}

func (r *chatRepository) IsUserInConversation(userID, conversationID uint) (bool, error) {
	var count int64
	
	err := r.db.Model(&models.Discussion{}).
		Where("id = ? AND (user1_id = ? OR user2_id = ?)", conversationID, userID, userID).
		Count(&count).Error
	
	return count > 0, err
}

func (r *chatRepository) GetConversationParticipants(conversationID uint) ([]uint, error) {
	var conversation models.Discussion
	
	err := r.db.Select("user1_id, user2_id").First(&conversation, conversationID).Error
	if err != nil {
		return nil, err
	}
	
	return []uint{conversation.User1ID, conversation.User2ID}, nil
}

func (r *chatRepository) UpdateLastMessage(conversationID uint, content string) error {
	now := time.Now()
	return r.db.Model(&models.Discussion{}).
		Where("id = ?", conversationID).
		Updates(map[string]any{
			"last_message_content": content,
			"last_message_at":      &now,
		}).Error
}

// Message operations
func (r *chatRepository) GetMessages(conversationID uint, limit, offset int) ([]models.Message, error) {
	var messages []models.Message

	err := r.db.Where("conv_id = ?", conversationID).
		Order("time DESC").
		Limit(limit).
		Offset(offset).
		Find(&messages).Error

	return messages, err
}

func (r *chatRepository) GetMessage(messageID uint) (*models.Message, error) {
	var message models.Message

	err := r.db.First(&message, messageID).Error
	if err != nil {
		return nil, err
	}

	return &message, nil
}

func (r *chatRepository) SaveMessage(senderID, conversationID uint, content string) (*models.Message, error) {
	message := &models.Message{
		ConvID:   conversationID,
		SenderID: senderID,
		Msg:      content,
		Time:     time.Now(),
	}
	
	err := r.db.Create(message).Error
	if err != nil {
		return nil, err
	}
	
	// Update last message in conversation
	r.UpdateLastMessage(conversationID, content)
	
	return message, nil
}

func (r *chatRepository) MarkMessagesAsRead(conversationID, userID uint) error {
	now := time.Now()
	return r.db.Model(&models.Message{}).
		Where("conv_id = ? AND sender_id != ? AND read_at IS NULL", conversationID, userID).
		Update("read_at", &now).Error
}

func (r *chatRepository) GetUnreadCount(conversationID, userID uint) (int64, error) {
	var count int64

	err := r.db.Model(&models.Message{}).
		Where("conv_id = ? AND sender_id != ? AND read_at IS NULL", conversationID, userID).
		Count(&count).Error

	return count, err
}

// Reaction operations
func (r *chatRepository) AddReaction(messageID, userID uint, emoji string) (*models.MessageReaction, error) {
	reaction := &models.MessageReaction{
		MessageID: messageID,
		UserID:    userID,
		Emoji:     emoji,
	}

	// Try to create, if it exists then toggle (remove then re-add)
	err := r.db.Create(reaction).Error
	if err != nil {
		// If constraint violation, user already has this reaction, so remove it
		if r.db.Error != nil && r.db.Error.Error() != "" {
			return nil, r.RemoveReaction(messageID, userID, emoji)
		}
		return nil, err
	}

	return reaction, nil
}

func (r *chatRepository) RemoveReaction(messageID, userID uint, emoji string) error {
	return r.db.Where("message_id = ? AND user_id = ? AND emoji = ?", messageID, userID, emoji).
		Delete(&models.MessageReaction{}).Error
}

func (r *chatRepository) GetMessageReactions(messageID uint) ([]models.MessageReaction, error) {
	var reactions []models.MessageReaction

	err := r.db.Where("message_id = ?", messageID).
		Order("created_at ASC").
		Find(&reactions).Error

	return reactions, err
}

func (r *chatRepository) GetReactionsSummary(messageIDs []uint, currentUserID uint) (map[uint]models.ReactionSummary, error) {
	if len(messageIDs) == 0 {
		return make(map[uint]models.ReactionSummary), nil
	}

	var reactions []models.MessageReaction
	err := r.db.Where("message_id IN ?", messageIDs).
		Order("message_id, emoji, created_at ASC").
		Find(&reactions).Error

	if err != nil {
		return nil, err
	}

	// Group reactions by message and emoji
	summaryMap := make(map[uint]models.ReactionSummary)

	for _, reaction := range reactions {
		if summaryMap[reaction.MessageID].Reactions == nil {
			summaryMap[reaction.MessageID] = models.ReactionSummary{
				MessageID: reaction.MessageID,
				Reactions: make(map[string]models.ReactionInfo),
			}
		}

		summary := summaryMap[reaction.MessageID]
		reactionInfo := summary.Reactions[reaction.Emoji]

		reactionInfo.Count++
		reactionInfo.Users = append(reactionInfo.Users, reaction.UserID)
		if reaction.UserID == currentUserID {
			reactionInfo.HasUser = true
		}

		summary.Reactions[reaction.Emoji] = reactionInfo
		summaryMap[reaction.MessageID] = summary
	}

	return summaryMap, nil
}

// User presence operations
func (r *chatRepository) UpdateUserPresence(userID uint, isOnline bool) error {
	now := time.Now()
	presence := &models.UserPresence{
		UserID:       userID,
		IsOnline:     isOnline,
		LastActivity: now,
	}

	if !isOnline {
		presence.LastSeen = &now
	}

	return r.db.Save(presence).Error
}

func (r *chatRepository) GetUserPresence(userID uint) (*models.UserPresence, error) {
	var presence models.UserPresence

	err := r.db.Where("user_id = ?", userID).First(&presence).Error
	if err != nil {
		// If not found, return default offline status
		if err == gorm.ErrRecordNotFound {
			return &models.UserPresence{
				UserID:   userID,
				IsOnline: false,
			}, nil
		}
		return nil, err
	}

	return &presence, nil
}

func (r *chatRepository) GetUsersPresence(userIDs []uint) ([]models.UserPresence, error) {
	if len(userIDs) == 0 {
		return []models.UserPresence{}, nil
	}

	var presences []models.UserPresence

	err := r.db.Where("user_id IN ?", userIDs).Find(&presences).Error
	if err != nil {
		return nil, err
	}

	// Create a map for quick lookup
	presenceMap := make(map[uint]models.UserPresence)
	for _, p := range presences {
		presenceMap[p.UserID] = p
	}

	// Fill in missing users with default offline status
	result := make([]models.UserPresence, 0, len(userIDs))
	for _, userID := range userIDs {
		if presence, exists := presenceMap[userID]; exists {
			result = append(result, presence)
		} else {
			result = append(result, models.UserPresence{
				UserID:   userID,
				IsOnline: false,
			})
		}
	}

	return result, nil
}

func (r *chatRepository) SetUserOffline(userID uint) error {
	now := time.Now()
	return r.db.Model(&models.UserPresence{}).
		Where("user_id = ?", userID).
		Updates(models.UserPresence{
			IsOnline:     false,
			LastSeen:     &now,
			LastActivity: now,
		}).Error
}