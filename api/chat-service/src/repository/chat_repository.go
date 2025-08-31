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
		Updates(map[string]interface{}{
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