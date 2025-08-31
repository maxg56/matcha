package handlers

import (
	"chat-service/src/middleware"
	"chat-service/src/services"
	"chat-service/src/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetUserConversations(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	convService := services.NewConversationService()
	conversations, err := convService.GetUserConversations(userID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to retrieve conversations")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, conversations)
}

func GetConversation(c *gin.Context) {
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

	conversation, err := convService.GetConversation(uint(conversationID))
	if err != nil {
		utils.RespondError(c, http.StatusNotFound, "Conversation not found")
		return
	}

	utils.RespondSuccess(c, http.StatusOK, conversation)
}

func CreateConversation(c *gin.Context) {
	var req struct {
		UserID uint `json:"user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Invalid request data")
		return
	}

	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.RespondError(c, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	if req.UserID == userID {
		utils.RespondError(c, http.StatusBadRequest, "Cannot create conversation with yourself")
		return
	}

	convService := services.NewConversationService()
	conversation, err := convService.CreateConversation(userID, req.UserID)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to create conversation")
		return
	}

	utils.RespondCreated(c, conversation)
}