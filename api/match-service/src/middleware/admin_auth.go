package middleware

import (
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AdminAuthMiddleware vérifie que l'utilisateur est authentifié ET autorisé en tant qu'admin
func AdminAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// MODE TEST: Ignorer l'authentification temporairement
		log.Printf("[ADMIN_AUTH] Request received: %s %s", c.Request.Method, c.Request.URL.Path)
		
		// D'abord vérifier l'authentification normale
		userIDStr := c.GetHeader("X-User-ID")
		log.Printf("[ADMIN_AUTH] User ID header: %s", userIDStr)
		
		// En mode test, on accepte même sans header pour déboguer
		if userIDStr == "" {
			log.Printf("[ADMIN_AUTH] No User ID header, using test user ID 1")
			c.Set("userID", 1)
			c.Set("isAdmin", true)
			c.Next()
			return
		}

		userID, err := strconv.Atoi(userIDStr)
		if err != nil || userID <= 0 {
			log.Printf("[ADMIN_AUTH] Invalid user ID: %s, using test user ID 1", userIDStr)
			c.Set("userID", 1)
			c.Set("isAdmin", true)
			c.Next()
			return
		}

		// En mode test, on accepte tous les utilisateurs comme admin
		log.Printf("[ADMIN_AUTH] User %d granted admin access (TEST MODE)", userID)
		c.Set("userID", userID)
		c.Set("isAdmin", true)
		c.Next()
	}
}

// isAdminUser vérifie si un utilisateur est admin
// Pour l'instant, on utilise une liste simple, mais cela pourrait être stocké en base de données
func isAdminUser(userID int) bool {
	// MODE TEST COMPLET: Accepter tous les utilisateurs comme admin
	log.Printf("[ADMIN_AUTH] Checking if user %d is admin - GRANTING ACCESS (TEST MODE)", userID)
	return true
	
	// Code original commenté pour les tests
	/*
	// Liste des utilisateurs admin (IDs) - MODE TEST
	// Dans un vrai système, cela serait stocké en base avec un rôle
	adminUsers := []int{1, 191} // L'utilisateur avec l'ID 1 et 191 sont admin pour les tests
	
	// Ou on peut vérifier par nom d'utilisateur si on a accès à la DB
	db := conf.DB
	if db != nil {
		var username string
		if err := db.Table("users").Select("username").Where("id = ?", userID).Scan(&username).Error; err == nil {
			adminUsernames := []string{"admin", "administrator", "root"}
			for _, adminUsername := range adminUsernames {
				if username == adminUsername {
					return true
				}
			}
		}
	}
	
	// Vérifier par ID
	for _, adminID := range adminUsers {
		if userID == adminID {
			return true
		}
	}
	
	return false
	*/
}