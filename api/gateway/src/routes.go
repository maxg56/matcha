package main

import "github.com/gin-gonic/gin"

// Auth service routes
func setupAuthRoutes(r *gin.Engine) {
	auth := r.Group("/api/v1/auth" )

	// Make base path return auth-service health
	auth.GET("/", proxyRequest("auth", "/health"))

	// Proxy to real upstream paths
	auth.POST("/register", proxyRequest("auth", "/api/v1/auth/register"))
	auth.POST("/login", proxyRequest("auth", "/api/v1/auth/login"))
	auth.POST("/logout", proxyRequest("auth", "/api/v1/auth/logout"))
	auth.POST("/refresh", proxyRequest("auth", "/api/v1/auth/refresh"))
	auth.GET("/verify", proxyRequest("auth", "/api/v1/auth/verify"))
	auth.POST("/forgot-password", proxyRequest("auth", "/api/v1/auth/forgot-password"))
	auth.POST("/reset-password", proxyRequest("auth", "/api/v1/auth/reset-password"))
}

// User service routes
func setupUserRoutes(r *gin.Engine) {
	user := r.Group("/api/users")
	user.Use(jwtMiddleware())

	// Map gateway-friendly paths to upstream /api/v1/users
	user.GET("/profile/:id", proxyRequest("user", "/api/v1/users/profile/:id"))
	user.PUT("/profile/:id", proxyRequest("user", "/api/v1/users/profile/:id"))
	user.DELETE("/profile/:id", proxyRequest("user", "/api/v1/users/profile/:id"))
	user.GET("/search", proxyRequest("user", "/api/v1/users/search"))
	user.POST("/upload-photo", proxyRequest("user", "/api/v1/users/upload-photo"))
}

// Media service routes
func setupMediaRoutes(r *gin.Engine) {
	media := r.Group("/api/media")
	media.Use(jwtMiddleware())

	media.GET("/", proxyRequest("media", "/health"))
	media.POST("/upload", proxyRequest("media", "/api/v1/media/upload"))
	media.GET("/:id", proxyRequest("media", "/api/v1/media/:id"))
	media.DELETE("/:id", proxyRequest("media", "/api/v1/media/:id"))
	media.GET("/user/:userId", proxyRequest("media", "/api/v1/media/user/:userId"))
}

// Match service routes
func setupMatchRoutes(r *gin.Engine) {
	match := r.Group("/api/matches")
	match.Use(jwtMiddleware())

	match.GET("/", proxyRequest("match", "/health"))
	match.GET("/list", proxyRequest("match", "/api/v1/matches"))
	match.POST("/like/:userId", proxyRequest("match", "/api/v1/matches/like/:userId"))
	match.POST("/pass/:userId", proxyRequest("match", "/api/v1/matches/pass/:userId"))
	match.DELETE("/:matchId", proxyRequest("match", "/api/v1/matches/:matchId"))
	match.GET("/suggestions", proxyRequest("match", "/api/v1/matches/suggestions"))
}

// Chat service routes
func setupChatRoutes(r *gin.Engine) {
	chat := r.Group("/api/chat")
	chat.Use(jwtMiddleware())

	chat.GET("/", proxyRequest("chat", "/health"))
	chat.GET("/conversations", proxyRequest("chat", "/api/v1/chat/conversations"))
	chat.GET("/conversations/:id", proxyRequest("chat", "/api/v1/chat/conversations/:id"))
	chat.POST("/conversations/:id/messages", proxyRequest("chat", "/api/v1/chat/conversations/:id/messages"))
	chat.GET("/conversations/:id/messages", proxyRequest("chat", "/api/v1/chat/conversations/:id/messages"))
	chat.PUT("/conversations/:id/read", proxyRequest("chat", "/api/v1/chat/conversations/:id/read"))
}

// Notification service routes
func setupNotifyRoutes(r *gin.Engine) {
	notify := r.Group("/api/notifications")
	notify.Use(jwtMiddleware())

	notify.GET("/", proxyRequest("notify", "/health"))
	notify.GET("/list", proxyRequest("notify", "/api/v1/notifications"))
	notify.PUT("/:id/read", proxyRequest("notify", "/api/v1/notifications/:id/read"))
	notify.DELETE("/:id", proxyRequest("notify", "/api/v1/notifications/:id"))
	notify.PUT("/read-all", proxyRequest("notify", "/api/v1/notifications/read-all"))
}
