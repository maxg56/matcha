package services

import (
	"chat-service/src/conf"
	"chat-service/src/models"
)

type ConversationService struct{}

func NewConversationService() *ConversationService {
	return &ConversationService{}
}

func (cs *ConversationService) GetUserConversations(userID uint) ([]models.Discussion, error) {
	var conversations []models.Discussion

	result := conf.DB.Where("user1_id = ? OR user2_id = ?", userID, userID).
		Order("last_message_at DESC NULLS LAST").
		Find(&conversations)

	if result.Error != nil {
		return nil, result.Error
	}

	return conversations, nil
}

func (cs *ConversationService) GetConversation(conversationID uint) (*models.Discussion, error) {
	var conversation models.Discussion

	result := conf.DB.Where("id = ?", conversationID).First(&conversation)
	if result.Error != nil {
		return nil, result.Error
	}

	return &conversation, nil
}

func (cs *ConversationService) CreateConversation(user1ID, user2ID uint) (*models.Discussion, error) {
	existing, err := cs.GetConversationBetweenUsers(user1ID, user2ID)
	if err == nil && existing != nil {
		return existing, nil
	}

	conversation := models.Discussion{
		User1ID: user1ID,
		User2ID: user2ID,
	}

	result := conf.DB.Create(&conversation)
	if result.Error != nil {
		return nil, result.Error
	}

	return &conversation, nil
}

func (cs *ConversationService) GetConversationBetweenUsers(user1ID, user2ID uint) (*models.Discussion, error) {
	var conversation models.Discussion

	result := conf.DB.Where(
		"(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
		user1ID, user2ID, user2ID, user1ID,
	).First(&conversation)

	if result.Error != nil {
		return nil, result.Error
	}

	return &conversation, nil
}

func (cs *ConversationService) IsUserInConversation(userID, conversationID uint) (bool, error) {
	var count int64

	result := conf.DB.Model(&models.Discussion{}).
		Where("id = ? AND (user1_id = ? OR user2_id = ?)", conversationID, userID, userID).
		Count(&count)

	if result.Error != nil {
		return false, result.Error
	}

	return count > 0, nil
}

func (cs *ConversationService) GetConversationParticipants(conversationID uint) ([]uint, error) {
	var conversation models.Discussion

	result := conf.DB.Where("id = ?", conversationID).First(&conversation)
	if result.Error != nil {
		return nil, result.Error
	}

	return []uint{conversation.User1ID, conversation.User2ID}, nil
}