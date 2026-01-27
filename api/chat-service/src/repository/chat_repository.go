package repository

import (
	"chat-service/src/models"
	"chat-service/src/types"
	"errors"
	"fmt"
	"strings"
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

func (r *chatRepository) DeleteConversation(conversationID uint) error {
	// Delete the conversation - this will cascade delete messages and reactions
	// due to foreign key constraints in the database
	result := r.db.Delete(&models.Discussion{}, conversationID)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("conversation not found")
	}
	return nil
}

func (r *chatRepository) FindConversationBetweenUsers(user1ID, user2ID uint) (*models.Discussion, error) {
	var conversation models.Discussion
	
	err := r.db.Where(
		"(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)",
		user1ID, user2ID, user2ID, user1ID,
	).First(&conversation).Error
	
	return &conversation, err
}

// User info operations for enriching conversations
func (r *chatRepository) GetUserInfo(userID uint) (*types.UserInfo, error) {
	var user models.Users

	// Get user basic info including first_name and last_name
	err := r.db.Select("id, username, first_name, last_name").First(&user, userID).Error
	if err != nil {
		return nil, err
	}

	// Get profile image filename - use a simple string variable instead of sql.NullString
	var filename string
	err = r.db.Table("images").
		Select("filename").
		Where("user_id = ? AND is_profile = ? AND is_active = ?", userID, true, true).
		First(&filename).Error

	userInfo := &types.UserInfo{
		ID:        user.ID,
		Username:  user.Username,
		FirstName: user.FirstName,
		LastName:  user.LastName,
	}

	// If profile image found, build full URL
	if err == nil && filename != "" {
		// Build full image URL - assuming images are served from /api/v1/media/images/
		userInfo.Avatar = "/api/v1/media/images/" + filename
	}
	// If no profile image found, that's OK - we'll use default in frontend

	return userInfo, nil
}

func (r *chatRepository) GetUsersInfo(userIDs []uint) (map[uint]*types.UserInfo, error) {
	if len(userIDs) == 0 {
		return make(map[uint]*types.UserInfo), nil
	}

	// Get users basic info including first_name and last_name
	var users []models.Users
	err := r.db.Select("id, username, first_name, last_name").Where("id IN ?", userIDs).Find(&users).Error
	if err != nil {
		return nil, err
	}

	// Get profile images for these users - use struct with proper tags
	type UserAvatar struct {
		UserID   uint   `gorm:"column:user_id"`
		Filename string `gorm:"column:filename"`
	}

	var avatars []UserAvatar
	err = r.db.Table("images").
		Select("user_id, filename").
		Where("user_id IN ? AND is_profile = ? AND is_active = ?", userIDs, true, true).
		Scan(&avatars).Error // Use Scan instead of Find to avoid GORM model issues

	// If no avatars found, that's OK - we'll continue without them
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		// Log the error but don't fail the whole request
		return r.buildUsersInfoWithoutAvatars(users), nil
	}

	// Create avatar map for quick lookup
	avatarMap := make(map[uint]string)
	for _, avatar := range avatars {
		if avatar.Filename != "" {
			// Build full image URL
			avatarMap[avatar.UserID] = "/api/v1/media/images/" + avatar.Filename
		}
	}

	// Combine user info with avatars
	result := make(map[uint]*types.UserInfo)
	for _, user := range users {
		userInfo := &types.UserInfo{
			ID:        user.ID,
			Username:  user.Username,
			FirstName: user.FirstName,
			LastName:  user.LastName,
		}

		if avatarURL, exists := avatarMap[user.ID]; exists {
			userInfo.Avatar = avatarURL
		}

		result[user.ID] = userInfo
	}

	return result, nil
}

// Helper function to build user info without avatars
func (r *chatRepository) buildUsersInfoWithoutAvatars(users []models.Users) map[uint]*types.UserInfo {
	result := make(map[uint]*types.UserInfo)
	for _, user := range users {
		result[user.ID] = &types.UserInfo{
			ID:        user.ID,
			Username:  user.Username,
			FirstName: user.FirstName,
			LastName:  user.LastName,
		}
	}
	return result
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
	// First, check if the message exists
	var messageExists bool
	err := r.db.Model(&models.Message{}).
		Select("1").
		Where("id = ?", messageID).
		Limit(1).
		Scan(&messageExists).Error

	if err != nil {
		return nil, fmt.Errorf("failed to check message existence: %w", err)
	}

	if !messageExists {
		return nil, fmt.Errorf("message with ID %d does not exist", messageID)
	}

	reaction := &models.MessageReaction{
		MessageID: messageID,
		UserID:    userID,
		Emoji:     emoji,
	}

	// Try to create the reaction
	err = r.db.Create(reaction).Error
	if err != nil {
		// Check if it's a unique constraint violation (user already has this reaction)
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "UNIQUE constraint") {
			// User already has this reaction, this is a toggle operation - remove it
			removeErr := r.RemoveReaction(messageID, userID, emoji)
			if removeErr != nil {
				return nil, fmt.Errorf("failed to remove existing reaction: %w", removeErr)
			}
			// Return a special error to indicate this was a toggle (removal)
			return nil, fmt.Errorf("reaction_removed")
		}
		return nil, fmt.Errorf("failed to add reaction: %w", err)
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