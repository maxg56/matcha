package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	"match-service/src/services"
	"match-service/src/utils"
)

func GetMatrixHandler(c *gin.Context) {
	var userIDs []int
	
	// Parse user_ids parameter if provided
	if userIDsParam := c.Query("user_ids"); userIDsParam != "" {
		idStrings := strings.Split(userIDsParam, ",")
		for _, idStr := range idStrings {
			if id, err := strconv.Atoi(strings.TrimSpace(idStr)); err == nil {
				userIDs = append(userIDs, id)
			} else {
				utils.RespondError(c, "Invalid user_ids format. Use comma-separated integers.", http.StatusBadRequest)
				return
			}
		}
	}

	// Parse include_metadata parameter (default true)
	includeMetadata := c.DefaultQuery("include_metadata", "true") == "true"

	matrixService := services.NewMatrixService()
	matrixData, err := matrixService.GetUsersMatrix(userIDs, includeMetadata)
	if err != nil {
		utils.RespondError(c, "Failed to generate matrix: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, matrixData)
}

func GetCompatibleMatrixHandler(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		utils.RespondError(c, "Invalid user ID", http.StatusBadRequest)
		return
	}

	matrixService := services.NewMatrixService()
	compatibleUsers, err := matrixService.GetCompatibleUsersMatrix(userID)
	if err != nil {
		utils.RespondError(c, "Failed to get compatible users: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"target_user_id":   userID,
		"compatible_users": compatibleUsers,
		"count":           len(compatibleUsers),
	})
}

func GenerateMatrixHandler(c *gin.Context) {
	var request struct {
		UserIDs         []int  `json:"user_ids"`
		IncludeMetadata bool   `json:"include_metadata"`
		Filename        string `json:"filename"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		utils.RespondError(c, "Invalid request: "+err.Error(), http.StatusBadRequest)
		return
	}

	if request.Filename == "" {
		request.Filename = "users_matrix.json"
	}

	matrixService := services.NewMatrixService()
	result, err := matrixService.ExportMatrixToFile(request.UserIDs, request.IncludeMetadata, request.Filename)
	if err != nil {
		utils.RespondError(c, "Failed to export matrix: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.RespondSuccess(c, http.StatusOK, result)
}