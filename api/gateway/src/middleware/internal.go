package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// InternalServiceMiddleware vérifie que la requête provient d'un service interne autorisé
func InternalServiceMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Méthode 1: Vérification par clé API interne
		internalKey := c.GetHeader("X-Internal-Key")
		expectedKey := os.Getenv("INTERNAL_API_KEY")

		if expectedKey != "" && internalKey == expectedKey {
			c.Next()
			return
		}

		// Méthode 2: Vérification par IP (services Docker internes)
		clientIP := c.ClientIP()
		if isInternalIP(clientIP) {
			c.Next()
			return
		}

		// Méthode 3: Vérification par User-Agent spécifique (fallback)
		userAgent := c.GetHeader("User-Agent")
		if strings.Contains(userAgent, "matcha-internal-service") {
			c.Next()
			return
		}

		// Aucune méthode d'authentification valide
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized: Internal service access required",
		})
		c.Abort()
	})
}

// isInternalIP vérifie si l'IP est une adresse interne autorisée
func isInternalIP(ip string) bool {
	// IPs internes Docker par défaut
	internalIPs := []string{
		"127.0.0.1",
		"::1",
		"localhost",
	}

	// IPs des réseaux Docker internes
	internalNetworks := []string{
		"172.", // Réseau Docker par défaut
		"10.",  // Réseaux privés
		"192.168.", // Réseaux privés
	}

	// Vérifier les IPs exactes
	for _, internalIP := range internalIPs {
		if ip == internalIP {
			return true
		}
	}

	// Vérifier les réseaux
	for _, network := range internalNetworks {
		if strings.HasPrefix(ip, network) {
			return true
		}
	}

	return false
}