package handlers

import (
	"chat-service/src/middleware"
	"chat-service/src/models"
	"chat-service/src/services"
	"chat-service/src/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetMessages(c *gin.Context) {
	conversationIDStr := c.Param("conversationID")
	conversationID, err := strconv.Atoi(conversationIDStr)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid conversation ID")
		return
	}

	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	convService := services.NewConversationService()
	isParticipant, err := convService.IsUserInConversation(userID, uint(conversationID))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to verify access")
		return
	}

	if !isParticipant {
		utils.RespondError(c, http.StatusForbidden, "Access denied")
		return
	}

	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}

	offsetStr := c.DefaultQuery("offset", "0")
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	msgService := services.NewMessageService()
	messages, err := msgService.GetMessages(uint(conversationID), limit, offset)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to retrieve messages")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, messages)
}

func SendMessage(c *gin.Context) {
	var req models.MessageRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request data")
		return
	}

	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	convService := services.NewConversationService()
	isParticipant, err := convService.IsUserInConversation(userID, req.ConversationID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to verify access")
		return
	}

	if !isParticipant {
		utils.RespondError(c, http.StatusForbidden, "Access denied")
		return
	}

	msgService := services.NewMessageService()
	message, err := msgService.SaveMessage(userID, req.ConversationID, req.Message)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to save message")
		return
	}

	participants, err := convService.GetConversationParticipants(req.ConversationID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to get participants")
		return
	}

	err = msgService.PublishMessage(*message, participants)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to publish message")
		return
	}

	utils.RespondCreated(c, message)
}

func MarkMessagesAsRead(c *gin.Context) {
	conversationIDStr := c.Param("conversationID")
	conversationID, err := strconv.Atoi(conversationIDStr)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid conversation ID")
		return
	}

	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	convService := services.NewConversationService()
	isParticipant, err := convService.IsUserInConversation(userID, uint(conversationID))
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to verify access")
		return
	}

	if !isParticipant {
		utils.RespondError(c, http.StatusForbidden, "Access denied")
		return
	}

	msgService := services.NewMessageService()
	err = msgService.MarkMessagesAsRead(uint(conversationID), userID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to mark messages as read")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{"message": "Messages marked as read"})
}