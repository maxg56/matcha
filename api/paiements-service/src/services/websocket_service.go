package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

// WebSocketService gère la communication avec le gateway via WebSocket
type WebSocketService struct {
	gatewayURL string
	client     *http.Client
}

// NewWebSocketService crée une nouvelle instance du service WebSocket
func NewWebSocketService() *WebSocketService {
	return &WebSocketService{
		gatewayURL: getEnv("GATEWAY_URL", "http://gateway:8080"),
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// WebSocketMessage représente un message à envoyer via WebSocket
type WebSocketMessage struct {
	Type     string      `json:"type"`
	UserID   string      `json:"user_id"`
	Channel  string      `json:"channel,omitempty"`
	Data     interface{} `json:"data"`
	FromUser string      `json:"from_user,omitempty"`
}

// SendSubscriptionEvent envoie un événement d'abonnement via WebSocket
func (ws *WebSocketService) SendSubscriptionEvent(userID uint, eventType string, data map[string]interface{}) {
	message := WebSocketMessage{
		Type:   eventType,
		UserID: fmt.Sprintf("%d", userID),
		Data:   data,
	}

	ws.sendMessage(message)
}

// SendPaymentEvent envoie un événement de paiement via WebSocket
func (ws *WebSocketService) SendPaymentEvent(userID uint, eventType string, data map[string]interface{}) {
	message := WebSocketMessage{
		Type:   eventType,
		UserID: fmt.Sprintf("%d", userID),
		Data:   data,
	}

	ws.sendMessage(message)
}

// SendPremiumActivation envoie une notification d'activation premium
func (ws *WebSocketService) SendPremiumActivation(userID uint, planType string, endDate *time.Time) {
	data := map[string]interface{}{
		"message":   "Premium activé avec succès!",
		"plan_type": planType,
	}

	if endDate != nil {
		data["end_date"] = endDate.Format(time.RFC3339)
	}

	message := WebSocketMessage{
		Type:   "premium_activated",
		UserID: fmt.Sprintf("%d", userID),
		Data:   data,
	}

	ws.sendMessage(message)
}

// SendPremiumCancellation envoie une notification d'annulation premium
func (ws *WebSocketService) SendPremiumCancellation(userID uint, cancelAtPeriodEnd bool, endDate *time.Time) {
	data := map[string]interface{}{
		"cancel_at_period_end": cancelAtPeriodEnd,
	}

	if cancelAtPeriodEnd {
		data["message"] = "Votre abonnement sera annulé à la fin de la période de facturation"
		if endDate != nil {
			data["end_date"] = endDate.Format(time.RFC3339)
		}
	} else {
		data["message"] = "Votre abonnement premium a été annulé"
	}

	message := WebSocketMessage{
		Type:   "premium_cancelled",
		UserID: fmt.Sprintf("%d", userID),
		Data:   data,
	}

	ws.sendMessage(message)
}

// SendPaymentSuccess envoie une notification de paiement réussi
func (ws *WebSocketService) SendPaymentSuccess(userID uint, amount float64, currency string) {
	data := map[string]interface{}{
		"message":  "Paiement effectué avec succès!",
		"amount":   amount,
		"currency": currency,
	}

	message := WebSocketMessage{
		Type:   "payment_success",
		UserID: fmt.Sprintf("%d", userID),
		Data:   data,
	}

	ws.sendMessage(message)
}

// SendPaymentFailure envoie une notification d'échec de paiement
func (ws *WebSocketService) SendPaymentFailure(userID uint, reason string) {
	data := map[string]interface{}{
		"message": "Échec du paiement",
		"reason":  reason,
	}

	message := WebSocketMessage{
		Type:   "payment_failed",
		UserID: fmt.Sprintf("%d", userID),
		Data:   data,
	}

	ws.sendMessage(message)
}

// SendTrialEndingWarning envoie un avertissement de fin d'essai gratuit
func (ws *WebSocketService) SendTrialEndingWarning(userID uint, daysLeft int) {
	data := map[string]interface{}{
		"message":   fmt.Sprintf("Votre essai gratuit se termine dans %d jour(s)", daysLeft),
		"days_left": daysLeft,
	}

	message := WebSocketMessage{
		Type:   "trial_ending",
		UserID: fmt.Sprintf("%d", userID),
		Data:   data,
	}

	ws.sendMessage(message)
}

// sendMessage envoie un message au gateway pour diffusion WebSocket
func (ws *WebSocketService) sendMessage(message WebSocketMessage) {
	// Sérialiser le message en JSON
	jsonData, err := json.Marshal(message)
	if err != nil {
		log.Printf("Failed to marshal WebSocket message: %v", err)
		return
	}

	// Envoyer la requête HTTP au gateway
	url := fmt.Sprintf("%s/api/internal/websocket/broadcast", ws.gatewayURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("Failed to create HTTP request for WebSocket: %v", err)
		return
	}

	
	req.Header.Set("Content-Type", "application/json")

	// Ajouter un header d'authentification interne si configuré
	if internalKey := os.Getenv("INTERNAL_API_KEY"); internalKey != "" {
		req.Header.Set("X-Internal-Key", internalKey)
	}

	// Exécuter la requête
	resp, err := ws.client.Do(req)
	if err != nil {
		log.Printf("Failed to send WebSocket message to gateway: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Gateway returned non-OK status for WebSocket message: %d", resp.StatusCode)
		return
	}

	log.Printf("Successfully sent WebSocket message of type %s to user %s", message.Type, message.UserID)
}

// BroadcastToChannel envoie un message à un canal spécifique
func (ws *WebSocketService) BroadcastToChannel(channel string, eventType string, data map[string]interface{}) {
	message := WebSocketMessage{
		Type:    eventType,
		Channel: channel,
		Data:    data,
	}

	ws.sendMessage(message)
}

// SendSystemNotification envoie une notification système
func (ws *WebSocketService) SendSystemNotification(userID uint, title string, message string, notificationType string) {
	data := map[string]interface{}{
		"title":   title,
		"message": message,
		"type":    notificationType,
	}

	wsMessage := WebSocketMessage{
		Type:   "system_notification",
		UserID: fmt.Sprintf("%d", userID),
		Data:   data,
	}

	ws.sendMessage(wsMessage)
}

// getEnv récupère une variable d'environnement avec une valeur par défaut
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}