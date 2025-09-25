package models

import "time"

// MessageReaction represents a user's reaction to a message
type MessageReaction struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	MessageID uint      `gorm:"column:message_id;not null;index" json:"message_id"`
	UserID    uint      `gorm:"column:user_id;not null;index" json:"user_id"`
	Emoji     string    `gorm:"column:emoji;type:varchar(10);not null" json:"emoji"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`

	// Foreign key relationships
	Message Message `gorm:"foreignKey:MessageID;constraint:OnDelete:CASCADE" json:"-"`
}

func (MessageReaction) TableName() string {
	return "message_reactions"
}

// ReactionRequest represents a request to add/remove a reaction
type ReactionRequest struct {
	MessageID uint   `json:"message_id" binding:"required"`
	Emoji     string `json:"emoji" binding:"required,max=10"`
}

// ReactionSummary represents aggregated reaction data for a message
type ReactionSummary struct {
	MessageID uint                    `json:"message_id"`
	Reactions map[string]ReactionInfo `json:"reactions"`
}

// ReactionInfo contains details about a specific emoji reaction
type ReactionInfo struct {
	Count   int    `json:"count"`
	Users   []uint `json:"users"`
	HasUser bool   `json:"has_user"` // Whether the current user has reacted with this emoji
}

// UserPresence represents a user's online status
type UserPresence struct {
	UserID       uint       `gorm:"primaryKey;column:user_id" json:"user_id"`
	IsOnline     bool       `gorm:"column:is_online;default:false" json:"is_online"`
	LastSeen     *time.Time `gorm:"column:last_seen" json:"last_seen"`
	LastActivity time.Time  `gorm:"column:last_activity;autoUpdateTime" json:"last_activity"`
}

func (UserPresence) TableName() string {
	return "user_presence"
}