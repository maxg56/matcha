package models

import "time"

// Image maps to table `images`
type Image struct {
    ID     uint      `gorm:"primaryKey;column:id" json:"id"`
    UserID uint      `gorm:"column:user_id;not null" json:"user_id"`
    Image  string    `gorm:"column:image;not null" json:"image"`
    Time   time.Time `gorm:"column:time;autoCreateTime" json:"time"`
}

func (Image) TableName() string { return "images" }
