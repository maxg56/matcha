package models

import "time"

// ProfileView tracks when users view other users' profiles
type ProfileView struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	ViewerID  uint      `gorm:"column:viewer_id;not null" json:"viewer_id"`
	ViewedID  uint      `gorm:"column:viewed_id;not null" json:"viewed_id"`
	CreatedAt time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`

	// Relations
	Viewer User `gorm:"foreignKey:ViewerID;references:ID"`
	Viewed User `gorm:"foreignKey:ViewedID;references:ID"`
}

func (ProfileView) TableName() string { return "profile_views" }

// ProfileViewSummary provides aggregated view data for a user
type ProfileViewSummary struct {
	ViewedID      uint      `json:"viewed_id"`
	TotalViews    int       `json:"total_views"`
	UniqueViewers int       `json:"unique_viewers"`
	LastViewedAt  time.Time `json:"last_viewed_at"`
}