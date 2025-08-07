package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "user-service",
		})
	})

	// User routes
	users := r.Group("/api/v1/users")
	{
		users.GET("/profile/:id", getProfileHandler)
		users.PUT("/profile/:id", updateProfileHandler)
		users.DELETE("/profile/:id", deleteProfileHandler)
		users.GET("/search", searchUsersHandler)
		users.POST("/upload-photo", uploadPhotoHandler)
	}

	log.Println("User service starting on port 8002")
	log.Fatal(http.ListenAndServe(":8002", r))
}

func getProfileHandler(c *gin.Context) {
	// TODO: Implement get profile logic
	c.JSON(http.StatusOK, gin.H{"message": "Get profile endpoint"})
}

func updateProfileHandler(c *gin.Context) {
	// TODO: Implement update profile logic
	c.JSON(http.StatusOK, gin.H{"message": "Update profile endpoint"})
}

func deleteProfileHandler(c *gin.Context) {
	// TODO: Implement delete profile logic
	c.JSON(http.StatusOK, gin.H{"message": "Delete profile endpoint"})
}

func searchUsersHandler(c *gin.Context) {
	// TODO: Implement search users logic
	c.JSON(http.StatusOK, gin.H{"message": "Search users endpoint"})
}

func uploadPhotoHandler(c *gin.Context) {
	// TODO: Implement upload photo logic
	c.JSON(http.StatusOK, gin.H{"message": "Upload photo endpoint"})
}
