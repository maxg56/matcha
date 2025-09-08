package models

type UserTag struct {
	ID     uint `gorm:"primaryKey;column:id" json:"id"`
	UserID uint `gorm:"column:user_id;not null;index" json:"user_id"`
	TagID  uint `gorm:"column:tag_id;not null;index" json:"tag_id"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Tag  Tag  `gorm:"foreignKey:TagID" json:"tag,omitempty"`
}

func (UserTag) TableName() string {
	return "user_tags"
}