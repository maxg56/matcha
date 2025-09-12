package services

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"html/template"
	"net/smtp"
	"os"
	"path/filepath"
	"strings"
)

// EmailService handles sending emails
type EmailService struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
	FromName     string
}

// NewEmailService creates a new email service instance
func NewEmailService() *EmailService {
	return &EmailService{
		SMTPHost:     getEnvOrDefault("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     getEnvOrDefault("SMTP_PORT", "587"),
		SMTPUsername: getEnvOrDefault("SMTP_USERNAME", ""),
		SMTPPassword: getEnvOrDefault("SMTP_PASSWORD", ""),
		FromEmail:    getEnvOrDefault("FROM_EMAIL", "noreply@matcha.app"),
		FromName:     getEnvOrDefault("FROM_NAME", "Matcha"),
	}
}

// VerificationEmailData contains data for verification email template
type VerificationEmailData struct {
	VerificationCode string
}

// SendVerificationEmail sends a verification code email
func (es *EmailService) SendVerificationEmail(toEmail, verificationCode string) error {
	// Skip sending email if SMTP is not configured (development mode)
	if es.SMTPUsername == "" || es.SMTPPassword == "" {
		fmt.Printf("📧 Email verification code for %s: %s\n", toEmail, verificationCode)
		fmt.Printf("   (SMTP not configured - email not sent)\n")
		return nil
	}

	// Load and parse template
	templatePath := filepath.Join("templates", "email", "verification_email.html")
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		return fmt.Errorf("failed to parse email template: %v", err)
	}

	// Execute template with data
	var body bytes.Buffer
	data := VerificationEmailData{
		VerificationCode: verificationCode,
	}
	if err := tmpl.Execute(&body, data); err != nil {
		return fmt.Errorf("failed to execute email template: %v", err)
	}

	// Email subject
	subject := "Vérification de votre email - Matcha"

	return es.sendEmail(toEmail, subject, body.String())
}

// PasswordResetData contains data for password reset email template
type PasswordResetData struct {
	ResetURL string
}

// SendPasswordResetEmail sends a password reset email
func (es *EmailService) SendPasswordResetEmail(toEmail, resetToken string) error {
	// Get frontend URL from environment
	frontendURL := getEnvOrDefault("FRONTEND_URL", "http://localhost:3000")
	resetURL := fmt.Sprintf("%s/reinitialiser-mot-de-passe?token=%s", frontendURL, resetToken)
	
	// Skip sending email if SMTP is not configured (development mode)
	if es.SMTPUsername == "" || es.SMTPPassword == "" {
		fmt.Printf("🔑 Password reset for %s:\n", toEmail)
		fmt.Printf("   Link: %s\n", resetURL)
		fmt.Printf("   (SMTP not configured - email not sent)\n")
		return nil
	}

	// Load and parse template
	templatePath := filepath.Join("templates", "email", "password_reset.html")
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		return fmt.Errorf("failed to parse email template: %v", err)
	}

	// Execute template with data
	var body bytes.Buffer
	data := PasswordResetData{
		ResetURL: resetURL,
	}
	if err := tmpl.Execute(&body, data); err != nil {
		return fmt.Errorf("failed to execute email template: %v", err)
	}

	// Email subject
	subject := "Réinitialisation de votre mot de passe - Matcha"

	return es.sendEmail(toEmail, subject, body.String())
}

// sendEmail sends an email using SMTP
func (es *EmailService) sendEmail(to, subject, body string) error {
	// Set up authentication information
	auth := smtp.PlainAuth("", es.SMTPUsername, es.SMTPPassword, es.SMTPHost)

	// Build email message
	message := fmt.Sprintf("From: %s <%s>\r\n", es.FromName, es.FromEmail)
	message += fmt.Sprintf("To: %s\r\n", to)
	message += fmt.Sprintf("Subject: %s\r\n", subject)
	message += "MIME-Version: 1.0\r\n"
	message += "Content-Type: text/html; charset=UTF-8\r\n"
	message += "\r\n"
	message += body

	// Connect to the server, authenticate, set the sender and recipient,
	// and send the email all in one step
	serverAddr := es.SMTPHost + ":" + es.SMTPPort

	// For Gmail and other TLS-required servers
	if es.SMTPHost == "smtp.gmail.com" || strings.Contains(es.SMTPHost, "gmail") {
		return es.sendEmailWithTLS(serverAddr, auth, es.FromEmail, []string{to}, []byte(message))
	}

	// Standard SMTP (for other providers)
	return smtp.SendMail(serverAddr, auth, es.FromEmail, []string{to}, []byte(message))
}

// sendEmailWithTLS sends email with explicit TLS (needed for Gmail)
func (es *EmailService) sendEmailWithTLS(addr string, auth smtp.Auth, from string, to []string, msg []byte) error {
	// Connect to server
	client, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Errorf("failed to connect to SMTP server: %v", err)
	}
	defer client.Close()

	// Start TLS
	tlsConfig := &tls.Config{
		InsecureSkipVerify: false,
		ServerName:         es.SMTPHost,
	}

	if err = client.StartTLS(tlsConfig); err != nil {
		return fmt.Errorf("failed to start TLS: %v", err)
	}

	// Authenticate
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("failed to authenticate: %v", err)
	}

	// Set sender
	if err = client.Mail(from); err != nil {
		return fmt.Errorf("failed to set sender: %v", err)
	}

	// Set recipients
	for _, addr := range to {
		if err = client.Rcpt(addr); err != nil {
			return fmt.Errorf("failed to set recipient: %v", err)
		}
	}

	// Send message
	writer, err := client.Data()
	if err != nil {
		return fmt.Errorf("failed to get data writer: %v", err)
	}

	if _, err = writer.Write(msg); err != nil {
		return fmt.Errorf("failed to write message: %v", err)
	}

	if err = writer.Close(); err != nil {
		return fmt.Errorf("failed to close writer: %v", err)
	}

	return client.Quit()
}

// getEnvOrDefault gets environment variable or returns default value
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}