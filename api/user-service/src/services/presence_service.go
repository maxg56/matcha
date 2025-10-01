package services

import (
	"fmt"
	"time"
	"user-service/src/conf"
)

// PresenceService handles user online/offline status using Redis
type PresenceService struct{}

// NewPresenceService creates a new presence service
func NewPresenceService() *PresenceService {
	return &PresenceService{}
}

// UserPresence represents user presence information
type UserPresence struct {
	UserID       uint       `json:"user_id"`
	IsOnline     bool       `json:"is_online"`
	LastSeen     *time.Time `json:"last_seen,omitempty"`
	LastActivity time.Time  `json:"last_activity"`
}

// GetUserPresence gets presence information for a single user
func (ps *PresenceService) GetUserPresence(userID uint) (*UserPresence, error) {
	if conf.RedisClient == nil {
		return nil, fmt.Errorf("Redis client not initialized")
	}

	// Check if user is online
	isOnline, err := conf.IsUserOnline(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to check online status: %w", err)
	}

	presence := &UserPresence{
		UserID:       userID,
		IsOnline:     isOnline,
		LastActivity: time.Now(),
	}

	// Get last seen if user is offline
	if !isOnline {
		lastSeen, err := conf.GetUserLastSeen(userID)
		if err != nil {
			// Log error but don't fail the request
			fmt.Printf("Warning: failed to get last seen for user %d: %v\n", userID, err)
		} else {
			presence.LastSeen = lastSeen
		}
	}

	return presence, nil
}

// GetMultipleUsersPresence gets presence information for multiple users efficiently
func (ps *PresenceService) GetMultipleUsersPresence(userIDs []uint) (map[uint]*UserPresence, error) {
	if conf.RedisClient == nil {
		return nil, fmt.Errorf("Redis client not initialized")
	}

	if len(userIDs) == 0 {
		return make(map[uint]*UserPresence), nil
	}

	// Get online status for all users
	onlineStatuses, err := conf.GetMultipleUsersStatus(userIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to get online statuses: %w", err)
	}

	result := make(map[uint]*UserPresence)

	// For each user, create presence info
	for _, userID := range userIDs {
		isOnline, exists := onlineStatuses[userID]
		if !exists {
			isOnline = false
		}

		presence := &UserPresence{
			UserID:       userID,
			IsOnline:     isOnline,
			LastActivity: time.Now(),
		}

		// Get last seen if user is offline
		if !isOnline {
			lastSeen, err := conf.GetUserLastSeen(userID)
			if err != nil {
				// Log error but don't fail the request
				fmt.Printf("Warning: failed to get last seen for user %d: %v\n", userID, err)
			} else {
				presence.LastSeen = lastSeen
			}
		}

		result[userID] = presence
	}

	return result, nil
}

// SetUserOnline marks a user as online
func (ps *PresenceService) SetUserOnline(userID uint) error {
	return conf.SetUserOnline(userID)
}

// SetUserOffline marks a user as offline
func (ps *PresenceService) SetUserOffline(userID uint) error {
	return conf.SetUserOffline(userID)
}

// RefreshUserPresence extends the TTL for an online user (heartbeat)
func (ps *PresenceService) RefreshUserPresence(userID uint) error {
	return conf.RefreshUserOnline(userID)
}

// GetOnlineUsersCount returns the count of currently online users
func (ps *PresenceService) GetOnlineUsersCount() (int64, error) {
	if conf.RedisClient == nil {
		return 0, fmt.Errorf("Redis client not initialized")
	}

	count, err := conf.RedisClient.SCard(conf.Ctx, "online_users").Result()
	if err != nil {
		return 0, fmt.Errorf("failed to get online users count: %w", err)
	}

	return count, nil
}

// GetOnlineUsers returns a list of currently online user IDs
func (ps *PresenceService) GetOnlineUsers() ([]uint, error) {
	if conf.RedisClient == nil {
		return nil, fmt.Errorf("Redis client not initialized")
	}

	membersStr, err := conf.RedisClient.SMembers(conf.Ctx, "online_users").Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get online users: %w", err)
	}

	users := make([]uint, 0, len(membersStr))
	for _, memberStr := range membersStr {
		var userID uint
		if _, err := fmt.Sscanf(memberStr, "%d", &userID); err == nil {
			users = append(users, userID)
		}
	}

	return users, nil
}