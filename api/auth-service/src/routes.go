package main

import (
    "net/http"

    "github.com/gin-gonic/gin"
)

func registerRoutes(r *gin.Engine) {
    // Health check
    r.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status":  "ok",
            "service": "auth-service",
        })
    })

    // Auth routes
    auth := r.Group("/api/v1/auth")
    {
        auth.POST("/register", registerHandler)
        auth.POST("/login", loginHandler)
        auth.POST("/logout", logoutHandler)
        auth.POST("/refresh", refreshTokenHandler)
        auth.GET("/verify", verifyTokenHandler)
        auth.POST("/forgot-password", forgotPasswordHandler)
        auth.POST("/reset-password", resetPasswordHandler)
    }
}
