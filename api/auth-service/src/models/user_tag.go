package models

// UserTag maps to table `user_tags` (composite PK)
type UserTag struct {
    UserID uint `gorm:"column:user_id;primaryKey" json:"user_id"`
    TagID  uint `gorm:"column:tag_id;primaryKey" json:"tag_id"`
}

func (UserTag) TableName() string { return "user_tags" }
