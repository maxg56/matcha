package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"match-service/src/conf"
	"match-service/src/models"
	"match-service/src/utils"
)

// GetReceivedLikesHandler récupère les likes reçus par un utilisateur (IDs seulement)
func GetReceivedLikesHandler(c *gin.Context) {
	userID := c.GetInt("userID")

	// Récupérer les interactions où l'utilisateur est la cible et le type est "like"
	// mais exclure ceux avec qui on a déjà un match actif
	var interactions []models.UserInteraction
	err := conf.DB.Where(`target_user_id = ? AND interaction_type = ? AND user_id NOT IN (
		SELECT CASE 
			WHEN user1_id = ? THEN user2_id 
			ELSE user1_id 
		END 
		FROM matches 
		WHERE (user1_id = ? OR user2_id = ?) AND is_active = true
	)`, userID, "like", userID, userID, userID).
		Order("created_at DESC").Find(&interactions).Error

	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Failed to get received likes: "+err.Error())
		return
	}

	// Transformer les interactions en format de réponse simple
	likes := make([]map[string]interface{}, 0) // Initialiser avec un slice vide au lieu de nil
	for _, interaction := range interactions {
		like := map[string]interface{}{
			"id":             interaction.ID,
			"user_id":        interaction.UserID,
			"target_user_id": interaction.TargetUserID,
			"created_at":     interaction.CreatedAt,
		}
		likes = append(likes, like)
	}

	utils.RespondSuccess(c, http.StatusOK, gin.H{
		"likes": likes,
		"count": len(likes),
	})
}
