package main

import (
    "net/http"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
)

func registerHandler(c *gin.Context) {
    type RegisterRequest struct {
        Username string `json:"username" binding:"required"`
        Email    string `json:"email" binding:"required"`
        Password string `json:"password" binding:"required"`
    }
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
        return
    }
    // TODO: create user, hash password, persist
    c.JSON(http.StatusCreated, gin.H{"message": "user registered"})
}

func loginHandler(c *gin.Context) {
    type LoginRequest struct {
        Identifier string `json:"identifier" binding:"required"` // email or username
        Password   string `json:"password" binding:"required"`
    }
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
        return
    }
    // TODO: verify credentials, issue JWT + refresh
    c.JSON(http.StatusOK, gin.H{
        "access_token":  "stub-access-token",
        "refresh_token": "stub-refresh-token",
        "token_type":    "Bearer",
        "expires_in":    int((time.Minute * 15).Seconds()),
    })
}

func logoutHandler(c *gin.Context) {
    // TODO: invalidate refresh token / add to denylist if needed
    c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}

func refreshTokenHandler(c *gin.Context) {
    type RefreshRequest struct {
        RefreshToken string `json:"refresh_token" binding:"required"`
    }
    var req RefreshRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
        return
    }
    // TODO: validate refresh and issue new tokens
    c.JSON(http.StatusOK, gin.H{
        "access_token":  "stub-access-token",
        "refresh_token": "stub-refresh-token",
        "token_type":    "Bearer",
        "expires_in":    int((time.Minute * 15).Seconds()),
    })
}

func verifyTokenHandler(c *gin.Context) {
    auth := c.GetHeader("Authorization")
    if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
        c.JSON(http.StatusUnauthorized, gin.H{"valid": false, "error": "missing bearer token"})
        return
    }
    token := strings.TrimPrefix(auth, "Bearer ")
    _ = token // TODO: verify JWT
    c.JSON(http.StatusOK, gin.H{"valid": true})
}

func forgotPasswordHandler(c *gin.Context) {
    type ForgotPasswordRequest struct {
        Email string `json:"email" binding:"required"`
    }
    var req ForgotPasswordRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
        return
    }
    // TODO: generate reset token, send email
    c.JSON(http.StatusOK, gin.H{"message": "reset email sent"})
}

func resetPasswordHandler(c *gin.Context) {
    type ResetPasswordRequest struct {
        Token       string `json:"token" binding:"required"`
        NewPassword string `json:"new_password" binding:"required"`
    }
    var req ResetPasswordRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
        return
    }
    // TODO: verify token and update password
    c.JSON(http.StatusOK, gin.H{"message": "password updated"})
}
