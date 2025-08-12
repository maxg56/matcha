package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func registerRoutes(r *gin.Engine) {
	// Health check
	r.GET("/health", func(c *gin.Context) {
		respondSuccess(c, http.StatusOK, gin.H{
			"service": "auth-service",
			"ok":      true,
		})
	})

	// Auth routes
	h := NewAuthHandlers()
	auth := r.Group("/api/v1/auth")
	{
		auth.POST("/register", h.Register)
		auth.POST("/login", h.Login)
		auth.POST("/logout", h.Logout)
		auth.POST("/refresh", h.Refresh)
		auth.GET("/verify", h.Verify)
		auth.POST("/forgot-password", h.ForgotPassword)
		auth.POST("/reset-password", h.ResetPassword)
	}
}
