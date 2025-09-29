package middleware

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// JWTMiddleware vérifie la présence du JWT dans les headers
// Note: La validation JWT complète est effectuée par le gateway
func JWTMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Vérifier la présence de l'ID utilisateur dans les headers
		// Cet header est ajouté par le gateway après validation du JWT
		userID := c.GetHeader("X-User-ID")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Authentication required",
			})
			c.Abort()
			return
		}

		// Optionnel: vérifier la présence du token JWT
		token := c.GetHeader("X-JWT-Token")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "JWT token required",
			})
			c.Abort()
			return
		}

		// Continuer vers le handler suivant
		c.Next()
	})
}

// AdminMiddleware vérifie l'authentification admin via clé API interne
func AdminMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Récupérer la clé API interne
		apiKey := c.GetHeader("X-Internal-Key")
		expectedKey := os.Getenv("INTERNAL_API_KEY")

		if expectedKey == "" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Internal API key not configured",
			})
			c.Abort()
			return
		}

		if apiKey != expectedKey {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Invalid or missing API key",
			})
			c.Abort()
			return
		}

		// Continuer vers le handler suivant
		c.Next()
	})
}

// CORSMiddleware gère les requêtes CORS
func CORSMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-User-ID, X-JWT-Token, X-Internal-Key")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})
}

// RequestLoggerMiddleware enregistre les requêtes importantes
func RequestLoggerMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Log des requêtes sensibles
		if c.Request.URL.Path == "/api/stripe/webhook" {
			// Log spécial pour les webhooks Stripe
			signature := c.GetHeader("Stripe-Signature")
			if signature != "" {
				// Log uniquement que la signature est présente, pas la signature elle-même
				c.Set("stripe_webhook", true)
			}
		}

		c.Next()
	})
}