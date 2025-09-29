package notifications

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// NotificationService handles sending notifications to the notification service
type NotificationService struct {
	notifyServiceURL string
	httpClient       *http.Client
}

// NotificationTypes constants
const (
	TypeLike        = "1" // When a user receives a "like"
	TypeProfileView = "2" // When a user's profile is viewed
	TypeMessage     = "3" // When a user receives a message (already implemented)
	TypeMutualLike  = "4" // When a user they "liked" likes them back (mutual match)
	TypeUnlike      = "5" // When a connected user "unlikes" them
)

// NotificationPayload represents the payload sent to the notification service
type NotificationPayload struct {
	ToUserID   int    `json:"to_user_id"`
	NotifType  string `json:"notif_type"`
	Message    string `json:"message"`
	FromUserID int    `json:"from_user_id,omitempty"`
}

// NewNotificationService creates a new notification service instance
func NewNotificationService() *NotificationService {
	return &NotificationService{
		notifyServiceURL: "http://notify-service:8005",
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// SendLikeNotification sends a notification when someone likes a user
func (ns *NotificationService) SendLikeNotification(targetUserID, fromUserID int) error {
	payload := NotificationPayload{
		ToUserID:   targetUserID,
		NotifType:  TypeLike,
		Message:    "Quelqu'un vous a liké ❤️",
		FromUserID: fromUserID,
	}
	return ns.sendNotification(payload)
}

// SendProfileViewNotification sends a notification when someone views a user's profile
func (ns *NotificationService) SendProfileViewNotification(targetUserID, fromUserID int) error {
	payload := NotificationPayload{
		ToUserID:   targetUserID,
		NotifType:  TypeProfileView,
		Message:    "Quelqu'un a consulté votre profil 👀",
		FromUserID: fromUserID,
	}
	return ns.sendNotification(payload)
}

// SendMutualLikeNotification sends a notification when there's a mutual like (match)
func (ns *NotificationService) SendMutualLikeNotification(targetUserID, fromUserID int) error {
	payload := NotificationPayload{
		ToUserID:   targetUserID,
		NotifType:  TypeMutualLike,
		Message:    "C'est un match ! 🎉 Vous vous êtes mutuellement likés",
		FromUserID: fromUserID,
	}
	return ns.sendNotification(payload)
}

// SendUnlikeNotification sends a notification when someone unlikes a user they were matched with
func (ns *NotificationService) SendUnlikeNotification(targetUserID, fromUserID int) error {
	payload := NotificationPayload{
		ToUserID:   targetUserID,
		NotifType:  TypeUnlike,
		Message:    "Un utilisateur connecté ne vous like plus 💔",
		FromUserID: fromUserID,
	}
	return ns.sendNotification(payload)
}

// sendNotification sends the notification to the notification service
func (ns *NotificationService) sendNotification(payload NotificationPayload) error {
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		log.Printf("❌ Failed to marshal notification payload: %v", err)
		return fmt.Errorf("failed to marshal notification payload: %w", err)
	}

	req, err := http.NewRequest("POST", ns.notifyServiceURL+"/api/v1/notifications/send", bytes.NewBuffer(jsonPayload))
	if err != nil {
		log.Printf("❌ Failed to create notification request: %v", err)
		return fmt.Errorf("failed to create notification request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := ns.httpClient.Do(req)
	if err != nil {
		log.Printf("❌ Failed to send notification: %v", err)
		return fmt.Errorf("failed to send notification: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("❌ Notification service returned status: %d", resp.StatusCode)
		return fmt.Errorf("notification service returned status: %d", resp.StatusCode)
	}

	log.Printf("✅ Notification sent successfully to user %d (type: %s)", payload.ToUserID, payload.NotifType)
	return nil
}