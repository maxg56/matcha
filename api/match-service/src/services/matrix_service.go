package services

import (
	"encoding/json"
	"fmt"
	"os"

	"match-service/src/conf"
	"match-service/src/models"
)

type MatrixService struct{}

func NewMatrixService() *MatrixService {
	return &MatrixService{}
}

type MatrixData struct {
	Users    []UserMatrix `json:"users"`
	Metadata *Metadata    `json:"metadata,omitempty"`
}

type UserMatrix struct {
	ID                  int     `json:"id"`
	Age                 int     `json:"age"`
	Height              int     `json:"height,omitempty"`
	Fame                int     `json:"fame"`
	Gender              string  `json:"gender"`
	SexPref             string  `json:"sex_pref"`
	Latitude            float64 `json:"latitude,omitempty"`
	Longitude           float64 `json:"longitude,omitempty"`
	AlcoholConsumption  string  `json:"alcohol_consumption,omitempty"`
	Smoking             string  `json:"smoking,omitempty"`
	Cannabis            string  `json:"cannabis,omitempty"`
	Drugs               string  `json:"drugs,omitempty"`
	Pets                string  `json:"pets,omitempty"`
	SocialActivityLevel string  `json:"social_activity_level,omitempty"`
	SportActivity       string  `json:"sport_activity,omitempty"`
	EducationLevel      string  `json:"education_level,omitempty"`
	Religion            string  `json:"religion,omitempty"`
	RelationshipType    string  `json:"relationship_type"`
	ChildrenStatus      string  `json:"children_status,omitempty"`
	HairColor           string  `json:"hair_color,omitempty"`
	SkinColor           string  `json:"skin_color,omitempty"`
	EyeColor            string  `json:"eye_color,omitempty"`
	ZodiacSign          string  `json:"zodiac_sign,omitempty"`
	PoliticalView       string  `json:"political_view,omitempty"`
}

type Metadata struct {
	TotalUsers  int    `json:"total_users"`
	GeneratedAt string `json:"generated_at"`
	Version     string `json:"version"`
}

func (m *MatrixService) GetUsersMatrix(userIDs []int, includeMetadata bool) (*MatrixData, error) {
	var users []models.User
	query := conf.DB

	if len(userIDs) > 0 {
		query = query.Where("id IN ?", userIDs)
	}

	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}

	var userMatrices []UserMatrix
	for _, user := range users {
		userMatrix := UserMatrix{
			ID:               int(user.ID),
			Age:              user.Age,
			Fame:             user.Fame,
			Gender:           user.Gender,
			SexPref:          user.SexPref,
			RelationshipType: user.RelationshipType,
		}

		// Add optional fields
		if user.Height.Valid {
			userMatrix.Height = int(user.Height.Int64)
		}
		if user.Latitude.Valid {
			userMatrix.Latitude = user.Latitude.Float64
		}
		if user.Longitude.Valid {
			userMatrix.Longitude = user.Longitude.Float64
		}
		if user.AlcoholConsumption.Valid {
			userMatrix.AlcoholConsumption = user.AlcoholConsumption.String
		}
		if user.Smoking.Valid {
			userMatrix.Smoking = user.Smoking.String
		}
		if user.Cannabis.Valid {
			userMatrix.Cannabis = user.Cannabis.String
		}
		if user.Drugs.Valid {
			userMatrix.Drugs = user.Drugs.String
		}
		if user.Pets.Valid {
			userMatrix.Pets = user.Pets.String
		}
		if user.SocialActivityLevel.Valid {
			userMatrix.SocialActivityLevel = user.SocialActivityLevel.String
		}
		if user.SportActivity.Valid {
			userMatrix.SportActivity = user.SportActivity.String
		}
		if user.EducationLevel.Valid {
			userMatrix.EducationLevel = user.EducationLevel.String
		}
		if user.Religion.Valid {
			userMatrix.Religion = user.Religion.String
		}
		if user.ChildrenStatus.Valid {
			userMatrix.ChildrenStatus = user.ChildrenStatus.String
		}
		if user.HairColor.Valid {
			userMatrix.HairColor = user.HairColor.String
		}
		if user.SkinColor.Valid {
			userMatrix.SkinColor = user.SkinColor.String
		}
		if user.EyeColor.Valid {
			userMatrix.EyeColor = user.EyeColor.String
		}
		if user.ZodiacSign.Valid {
			userMatrix.ZodiacSign = user.ZodiacSign.String
		}
		if user.PoliticalView.Valid {
			userMatrix.PoliticalView = user.PoliticalView.String
		}

		userMatrices = append(userMatrices, userMatrix)
	}

	matrixData := &MatrixData{
		Users: userMatrices,
	}

	if includeMetadata {
		matrixData.Metadata = &Metadata{
			TotalUsers:  len(userMatrices),
			GeneratedAt: "now", // Would use proper timestamp in production
			Version:     "1.0",
		}
	}

	return matrixData, nil
}

func (m *MatrixService) GetCompatibleUsersMatrix(userID int) ([]UserMatrix, error) {
	// Get target user
	var targetUser models.User
	if err := conf.DB.First(&targetUser, userID).Error; err != nil {
		return nil, fmt.Errorf("user not found")
	}

	// Find compatible users based on sexual preferences
	var users []models.User
	query := conf.DB.Where("id != ? AND latitude IS NOT NULL AND longitude IS NOT NULL", userID)

	if targetUser.SexPref == "both" {
		query = query.Where("sex_pref = ? OR sex_pref = ?", targetUser.Gender, "both")
	} else {
		query = query.Where("gender = ? AND (sex_pref = ? OR sex_pref = ?)", 
			targetUser.SexPref, targetUser.Gender, "both")
	}

	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}

	matrixData, err := m.GetUsersMatrix([]int{}, false)
	if err != nil {
		return nil, err
	}

	// Filter only compatible users
	var compatibleUsers []UserMatrix
	for _, userMatrix := range matrixData.Users {
		for _, user := range users {
			if userMatrix.ID == int(user.ID) {
				compatibleUsers = append(compatibleUsers, userMatrix)
				break
			}
		}
	}

	return compatibleUsers, nil
}

func (m *MatrixService) ExportMatrixToFile(userIDs []int, includeMetadata bool, filename string) (map[string]interface{}, error) {
	matrixData, err := m.GetUsersMatrix(userIDs, includeMetadata)
	if err != nil {
		return nil, err
	}

	// Convert to JSON
	jsonData, err := json.MarshalIndent(matrixData, "", "  ")
	if err != nil {
		return nil, err
	}

	// Write to file (in production, you might want to use a proper file storage service)
	err = os.WriteFile(filename, jsonData, 0644)
	if err != nil {
		return nil, err
	}

	result := map[string]interface{}{
		"filename":    filename,
		"total_users": len(matrixData.Users),
		"file_size":   len(jsonData),
		"success":     true,
	}

	if includeMetadata {
		result["metadata"] = matrixData.Metadata
	}

	return result, nil
}