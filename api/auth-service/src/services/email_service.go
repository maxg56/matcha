package services

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
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

// SendVerificationEmail sends a verification code email
func (es *EmailService) SendVerificationEmail(toEmail, verificationCode string) error {
	// Skip sending email if SMTP is not configured (development mode)
	if es.SMTPUsername == "" || es.SMTPPassword == "" {
		fmt.Printf("📧 Email verification code for %s: %s\n", toEmail, verificationCode)
		fmt.Printf("   (SMTP not configured - email not sent)\n")
		return nil
	}

	// Email content
	subject := "Vérification de votre email - Matcha"
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Vérification Email</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; text-align: center; border-radius: 10px;">
        <h1 style="color: white; margin: 0;">💖 Matcha</h1>
        <p style="color: white; margin: 10px 0 0 0;">Vérification de votre compte</p>
    </div>
    
    <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Vérifiez votre email</h2>
        <p style="color: #666; line-height: 1.6;">
            Bienvenue sur Matcha ! Pour finaliser votre inscription, veuillez utiliser le code de vérification suivant :
        </p>
        
        <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0; color: #667eea;">Code de vérification</h3>
            <div style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 8px; margin: 10px 0;">
                %s
            </div>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
            Ce code est valide pendant <strong>15 minutes</strong>. Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
                Cet email a été envoyé par Matcha. Si vous avez des questions, contactez notre support.
            </p>
        </div>
    </div>
</body>
</html>
	`, verificationCode)

	return es.sendEmail(toEmail, subject, body)
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