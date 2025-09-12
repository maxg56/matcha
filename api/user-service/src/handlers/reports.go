package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"user-service/src/conf"
	"user-service/src/models"
	"user-service/src/utils"
)

// ReportRequest represents user report payload
type ReportRequest struct {
	ReportedID  uint   `json:"reported_id" binding:"required"`
	ReportType  string `json:"report_type" binding:"required,oneof=fake_account inappropriate_content harassment spam other"`
	Description string `json:"description" binding:"max=500"`
}

// CreateReportHandler creates a new user report
func CreateReportHandler(c *gin.Context) {
	// Get authenticated user ID
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	reporterID := authenticatedUserID.(uint)

	var req ReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "invalid report data: "+err.Error())
		return
	}

	// Users cannot report themselves
	if req.ReportedID == reporterID {
		utils.RespondError(c, http.StatusBadRequest, "cannot report yourself")
		return
	}

	// Check if reported user exists
	var reportedUser models.User
	if err := conf.DB.First(&reportedUser, req.ReportedID).Error; err != nil {
		utils.RespondError(c, http.StatusNotFound, "reported user not found")
		return
	}

	// Check if report already exists
	var existingReport models.UserReport
	if err := conf.DB.Where("reporter_id = ? AND reported_id = ? AND report_type = ?", 
		reporterID, req.ReportedID, req.ReportType).First(&existingReport).Error; err == nil {
		utils.RespondError(c, http.StatusConflict, "report already exists for this user and report type")
		return
	}

	// Create new report
	report := models.UserReport{
		ReporterID:  reporterID,
		ReportedID:  req.ReportedID,
		ReportType:  req.ReportType,
		Description: req.Description,
		Status:      "pending",
	}

	if err := conf.DB.Create(&report).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to create report")
		return
	}

	utils.RespondSuccess(c, http.StatusCreated, gin.H{
		"message": "Report submitted successfully",
		"report": gin.H{
			"id":          report.ID,
			"reported_id": report.ReportedID,
			"report_type": report.ReportType,
			"status":      report.Status,
			"created_at":  report.CreatedAt,
		},
	})
}

// GetUserReportsHandler gets reports submitted by the authenticated user
func GetUserReportsHandler(c *gin.Context) {
	// Get authenticated user ID
	authenticatedUserID, exists := c.Get("user_id")
	if !exists {
		utils.RespondError(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	userID := authenticatedUserID.(uint)

	// Parse limit parameter
	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	// Parse offset parameter
	offsetStr := c.DefaultQuery("offset", "0")
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	var reports []models.UserReport
	if err := conf.DB.Preload("Reported").
		Where("reporter_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&reports).Error; err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "failed to get reports")
		return
	}

	// Get total count
	var total int64
	conf.DB.Model(&models.UserReport{}).Where("reporter_id = ?", userID).Count(&total)

	// Format response
	var reportData []gin.H
	for _, report := range reports {
		reportData = append(reportData, gin.H{
			"id":           report.ID,
			"reported_id":  report.ReportedID,
			"report_type":  report.ReportType,
			"description":  report.Description,
			"status":       report.Status,
			"created_at":   report.CreatedAt,
			"updated_at":   report.UpdatedAt,
			"reported_user": gin.H{
				"id":       report.Reported.ID,
				"username": report.Reported.Username,
			},
		})
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"reports": reportData,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}