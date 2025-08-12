package models

// Relation maps to table `relations`
type Relation struct {
    ID       uint   `gorm:"primaryKey;column:id" json:"id"`
    User1ID  uint   `gorm:"column:user1_id;not null" json:"user1_id"`
    User2ID  uint   `gorm:"column:user2_id;not null" json:"user2_id"`
    // Schema in init.sql shows conflicting definitions; using varchar enums like/pass/block
    ValueUser1 string `gorm:"column:value_user1" json:"value_user1"`
    ValueUser2 string `gorm:"column:value_user2" json:"value_user2"`
}

func (Relation) TableName() string { return "relations" }
