package main

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

func forgotPasswordHandler(c *gin.Context) {
    type ForgotPasswordRequest struct {
        Email string `json:"email" binding:"required"`
    }
    var req ForgotPasswordRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        respondError(c, http.StatusBadRequest, "invalid payload")
        return
    }
    // TODO: generate reset token, send email
    respondSuccess(c, http.StatusOK, gin.H{"message": "reset email sent"})
}

func resetPasswordHandler(c *gin.Context) {
    type ResetPasswordRequest struct {
        Token       string `json:"token" binding:"required"`
        NewPassword string `json:"new_password" binding:"required"`
    }
    var req ResetPasswordRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        respondError(c, http.StatusBadRequest, "invalid payload")
        return
    }
    // TODO: verify token and update password
    respondSuccess(c, http.StatusOK, gin.H{"message": "password updated"})
}
