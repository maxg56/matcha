package handlers

import (
	"net/http"
	"strconv"
	
	"chat-service/src/middleware"
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

// Helper methods
func (h *ChatHandlers) parseConversationID(c *gin.Context) (uint, error) {
	conversationIDStr := c.Param("conversationID")
	conversationID, err := strconv.ParseUint(conversationIDStr, 10, 32)
	return uint(conversationID), err
}