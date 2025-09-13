package models

import "time"

// UserReport represents a report submitted by one user against another
type UserReport struct {
	ID            uint      `gorm:"primaryKey;column:id" json:"id"`
	ReporterID    uint      `gorm:"column:reporter_id;not null" json:"reporter_id"`
	ReportedID    uint      `gorm:"column:reported_id;not null" json:"reported_id"`
	ReportType    string    `gorm:"column:report_type;not null" json:"report_type"` // fake_account, inappropriate_content, harassment, spam, other
	Description   string    `gorm:"column:description;size:500" json:"description"`
	Status        string    `gorm:"column:status;default:pending" json:"status"` // pending, reviewed, resolved, dismissed
	AdminNotes    string    `gorm:"column:admin_notes;size:500" json:"admin_notes,omitempty"`
	CreatedAt     time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt     time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP" json:"updated_at"`
	ReviewedAt    *time.Time `gorm:"column:reviewed_at" json:"reviewed_at,omitempty"`

	// Relations
	Reporter User `gorm:"foreignKey:ReporterID;references:ID"`
	Reported User `gorm:"foreignKey:ReportedID;references:ID"`
}

func (UserReport) TableName() string { return "user_reports" }