package main

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func main() {
	r := gin.Default()

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
	}

	log.Println("Auth service starting on port 8001")
	log.Fatal(http.ListenAndServe(":8001", r))
}

func registerHandler(c *gin.Context) {
	// TODO: Implement registration logic
	c.JSON(http.StatusOK, gin.H{"message": "Register endpoint"})
}

func loginHandler(c *gin.Context) {
	// TODO: Implement login logic
	c.JSON(http.StatusOK, gin.H{"message": "Login endpoint"})
}

func logoutHandler(c *gin.Context) {
	// TODO: Implement logout logic
	c.JSON(http.StatusOK, gin.H{"message": "Logout endpoint"})
}

func refreshTokenHandler(c *gin.Context) {
	// TODO: Implement token refresh logic
	c.JSON(http.StatusOK, gin.H{"message": "Refresh token endpoint"})
}

func verifyTokenHandler(c *gin.Context) {
	// TODO: Implement token verification logic
	c.JSON(http.StatusOK, gin.H{"message": "Verify token endpoint"})
}
