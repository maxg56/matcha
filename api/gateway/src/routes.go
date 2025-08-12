package main

import "github.com/gin-gonic/gin"

// Auth service routes
func setupAuthRoutes(r *gin.Engine) {
	auth := r.Group("/api/auth")

	auth.POST("/register", proxyRequest("auth", "/register"))
	auth.POST("/login", proxyRequest("auth", "/login"))
	auth.POST("/logout", proxyRequest("auth", "/logout"))
	auth.POST("/refresh", proxyRequest("auth", "/refresh"))
	auth.GET("/verify", proxyRequest("auth", "/verify"))
	auth.POST("/forgot-password", proxyRequest("auth", "/forgot-password"))
	auth.POST("/reset-password", proxyRequest("auth", "/reset-password"))
}

// User service routes
func setupUserRoutes(r *gin.Engine) {
	user := r.Group("/api/users")
	user.Use(jwtMiddleware())

	user.GET("/profile", proxyRequest("user", "/profile"))
	user.PUT("/profile", proxyRequest("user", "/profile"))
	user.DELETE("/profile", proxyRequest("user", "/profile"))
	user.GET("/search", proxyRequest("user", "/search"))
	user.GET("/:id", proxyRequest("user", "/users/:id"))
	user.POST("/block/:id", proxyRequest("user", "/block/:id"))
	user.DELETE("/block/:id", proxyRequest("user", "/block/:id"))
	user.POST("/report/:id", proxyRequest("user", "/report/:id"))
}

// Media service routes
func setupMediaRoutes(r *gin.Engine) {
	media := r.Group("/api/media")
	media.Use(jwtMiddleware())

	media.POST("/upload", proxyRequest("media", "/upload"))
	media.GET("/:id", proxyRequest("media", "/media/:id"))
	media.DELETE("/:id", proxyRequest("media", "/media/:id"))
	media.GET("/user/:userId", proxyRequest("media", "/user/:userId"))
}

// Match service routes
func setupMatchRoutes(r *gin.Engine) {
	match := r.Group("/api/matches")
	match.Use(jwtMiddleware())

	match.GET("/", proxyRequest("match", "/matches"))
	match.POST("/like/:userId", proxyRequest("match", "/like/:userId"))
	match.POST("/pass/:userId", proxyRequest("match", "/pass/:userId"))
	match.DELETE("/:matchId", proxyRequest("match", "/matches/:matchId"))
	match.GET("/suggestions", proxyRequest("match", "/suggestions"))
}

// Chat service routes
func setupChatRoutes(r *gin.Engine) {
	chat := r.Group("/api/chat")
	chat.Use(jwtMiddleware())

	chat.GET("/conversations", proxyRequest("chat", "/conversations"))
	chat.GET("/conversations/:id", proxyRequest("chat", "/conversations/:id"))
	chat.POST("/conversations/:id/messages", proxyRequest("chat", "/conversations/:id/messages"))
	chat.GET("/conversations/:id/messages", proxyRequest("chat", "/conversations/:id/messages"))
	chat.PUT("/conversations/:id/read", proxyRequest("chat", "/conversations/:id/read"))
}

// Notification service routes
func setupNotifyRoutes(r *gin.Engine) {
	notify := r.Group("/api/notifications")
	notify.Use(jwtMiddleware())

	notify.GET("/", proxyRequest("notify", "/notifications"))
	notify.PUT("/:id/read", proxyRequest("notify", "/notifications/:id/read"))
	notify.DELETE("/:id", proxyRequest("notify", "/notifications/:id"))
	notify.PUT("/read-all", proxyRequest("notify", "/notifications/read-all"))
}
