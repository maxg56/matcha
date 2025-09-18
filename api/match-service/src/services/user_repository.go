package services

import (
	"errors"
	"time"

	"match-service/src/conf"
	"match-service/src/models"
	"match-service/src/utils"
)

// UserRepository handles basic CRUD operations for users
type UserRepository struct{}

// NewUserRepository creates a new UserRepository instance
func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

// ValidateUserExists checks if a user exists in the database
func (r *UserRepository) ValidateUserExists(userID int) error {
	var user models.User
	result := conf.DB.First(&user, userID)
	if result.Error != nil {
		return errors.New("user not found")
	}
	return nil
}

// GetUser retrieves a user by ID
func (r *UserRepository) GetUser(userID int) (*models.User, error) {
	var user models.User
	if err := conf.DB.First(&user, userID).Error; err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}

// GetUserVector converts a user to vector representation with caching
func (r *UserRepository) GetUserVector(userID int) (utils.UserVector, error) {
	// Check cache first
	if cached, exists := utils.GetCachedUserVector(userID); exists {
		return cached, nil
	}

	// Get user from database
	user, err := r.GetUser(userID)
	if err != nil {
		return utils.UserVector{}, err
	}

	// Convert to vector and cache
	vector := utils.UserToVector(user)
	utils.CacheUserVector(userID, vector, 10*time.Minute)

	return vector, nil
}

// GetUsersByIDs retrieves multiple users by their IDs
func (r *UserRepository) GetUsersByIDs(userIDs []int) ([]models.User, error) {
	var users []models.User
	if err := conf.DB.Where("id IN (?)", userIDs).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}