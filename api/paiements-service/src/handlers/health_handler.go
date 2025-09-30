package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/matcha/api/paiements-service/src/conf"
)

// HealthHandler gère les endpoints de santé du service
type HealthHandler struct{}

// NewHealthHandler crée un nouveau handler de santé
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// HealthCheck vérifie la santé du service
func (h *HealthHandler) HealthCheck(c *gin.Context) {
	health := gin.H{
		"status":  "healthy",
		"service": "paiements-service",
	}

	// Vérifier la connexion à la base de données
	if conf.IsConnected() {
		health["database"] = "connected"
	} else {
		health["database"] = "disconnected"
		health["status"] = "unhealthy"
	}

	// Déterminer le status code
	statusCode := http.StatusOK
	if health["status"] == "unhealthy" {
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, health)
}

// ReadinessCheck vérifie si le service est prêt à recevoir du trafic
func (h *HealthHandler) ReadinessCheck(c *gin.Context) {
	ready := true
	checks := gin.H{}

	// Vérifier la base de données
	if conf.IsConnected() {
		checks["database"] = "ready"
	} else {
		checks["database"] = "not_ready"
		ready = false
	}

	// Ajouter d'autres vérifications si nécessaire
	checks["stripe_config"] = "ready" // Assume que la config Stripe est OK si le service démarre

	result := gin.H{
		"ready":  ready,
		"checks": checks,
	}

	statusCode := http.StatusOK
	if !ready {
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, result)
}

// LivenessCheck vérifie si le service est vivant
func (h *HealthHandler) LivenessCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"alive":   true,
		"service": "paiements-service",
	})
}