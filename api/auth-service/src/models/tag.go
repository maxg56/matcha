package models

// Tag maps to table `tags`
type Tag struct {
	ID   uint   `gorm:"primaryKey;column:id" json:"id"`
	Name string `gorm:"column:name;uniqueIndex;not null" json:"name"`
}

func (Tag) TableName() string { return "tags" }
