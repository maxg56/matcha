package handlers

import (
	"net/http"
	"strconv"

	"chat-service/src/middleware"
	"chat-service/src/models"
	"chat-service/src/types"
	"chat-service/src/utils"

	"github.com/gin-gonic/gin"
)

type ChatHandlers struct {
	chatService types.ChatService
}

func NewChatHandlers(chatService types.ChatService) *ChatHandlers {
	return &ChatHandlers{
		chatService: chatService,
	}
}

// GetUserConversations lists all conversations for a user
func (h *ChatHandlers) GetUserConversations(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	conversations, err := h.chatService.GetUserConversations(userID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to retrieve conversations")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, conversations)
}

// GetConversation retrieves a specific conversation
func (h *ChatHandlers) GetConversation(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	conversationID, err := h.parseConversationID(c)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid conversation ID")
		return
	}

	conversation, err := h.chatService.GetConversation(userID, conversationID)
	if err != nil {
		if err.Error() == "access denied" {
			utils.RespondError(c, http.StatusForbidden, "Access denied")
			return
		}
		utils.RespondError(c, http.StatusNotFound, "Conversation not found")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, conversation)
}

// CreateConversation creates a new conversation
func (h *ChatHandlers) CreateConversation(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	var req types.ConversationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request data")
		return
	}

	conversation, err := h.chatService.CreateConversation(userID, req.UserID)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.RespondCreated(c, conversation)
}

// GetMessages retrieves messages from a conversation
func (h *ChatHandlers) GetMessages(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	conversationID, err := h.parseConversationID(c)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid conversation ID")
		return
	}

	// Parse pagination
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	messages, err := h.chatService.GetMessages(userID, conversationID, limit, offset)
	if err != nil {
		if err.Error() == "access denied" {
			utils.RespondError(c, http.StatusForbidden, "Access denied")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Failed to retrieve messages")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, messages)
}

// SendMessage sends a new message
func (h *ChatHandlers) SendMessage(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	var req types.MessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request data")
		return
	}

	message, err := h.chatService.SendMessage(userID, req.ConversationID, req.Message)
	if err != nil {
		if err.Error() == "access denied" {
			utils.RespondError(c, http.StatusForbidden, "Access denied")
			return
		}
		utils.RespondError(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.RespondCreated(c, message)
}

// MarkMessagesAsRead marks messages as read
func (h *ChatHandlers) MarkMessagesAsRead(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	conversationID, err := h.parseConversationID(c)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid conversation ID")
		return
	}

	err = h.chatService.MarkMessagesAsRead(userID, conversationID)
	if err != nil {
		if err.Error() == "access denied" {
			utils.RespondError(c, http.StatusForbidden, "Access denied")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Failed to mark messages as read")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{"message": "Messages marked as read"})
}

// AddReaction adds a reaction to a message
func (h *ChatHandlers) AddReaction(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	var req models.ReactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request data")
		return
	}

	reaction, err := h.chatService.AddReaction(userID, req.MessageID, req.Emoji)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to add reaction")
		return
	}

	utils.RespondCreated(c, reaction)
}

// RemoveReaction removes a reaction from a message
func (h *ChatHandlers) RemoveReaction(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	messageIDStr := c.Param("messageID")
	messageID, err := strconv.ParseUint(messageIDStr, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid message ID")
		return
	}

	emoji := c.Param("emoji")
	if emoji == "" {
		utils.RespondError(c, http.StatusBadRequest, "Emoji is required")
		return
	}

	err = h.chatService.RemoveReaction(userID, uint(messageID), emoji)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to remove reaction")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{"message": "Reaction removed"})
}

// GetMessageReactions gets all reactions for a message
func (h *ChatHandlers) GetMessageReactions(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	messageIDStr := c.Param("messageID")
	messageID, err := strconv.ParseUint(messageIDStr, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid message ID")
		return
	}

	reactions, err := h.chatService.GetMessageReactions(userID, uint(messageID))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to get reactions")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, reactions)
}

// SetUserOnline sets user online status
func (h *ChatHandlers) SetUserOnline(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	err = h.chatService.SetUserOnline(userID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to set user online")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{"message": "User set online"})
}

// SetUserOffline sets user offline status
func (h *ChatHandlers) SetUserOffline(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	err = h.chatService.SetUserOffline(userID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to set user offline")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{"message": "User set offline"})
}

// GetUserPresence gets user presence information
func (h *ChatHandlers) GetUserPresence(c *gin.Context) {
	userIDStr := c.Param("userID")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	presence, err := h.chatService.GetUserPresence(uint(userID))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to get user presence")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, presence)
}

// Helper methods
func (h *ChatHandlers) parseConversationID(c *gin.Context) (uint, error) {
	conversationIDStr := c.Param("conversationID")
	conversationID, err := strconv.ParseUint(conversationIDStr, 10, 32)
	return uint(conversationID), err
}