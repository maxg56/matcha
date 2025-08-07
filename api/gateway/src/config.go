package main

import "os"

type ServiceConfig struct {
	Name string
	URL  string
}

var services map[string]ServiceConfig

func initServices() {
	services = map[string]ServiceConfig{
		"auth": {
			Name: "auth-service",
			URL:  getEnvOrDefault("AUTH_SERVICE_URL", "http://auth-service:8001"),
		},
		"user": {
			Name: "user-service",
			URL:  getEnvOrDefault("USER_SERVICE_URL", "http://user-service:8002"),
		},
		"media": {
			Name: "media-service",
			URL:  getEnvOrDefault("MEDIA_SERVICE_URL", "http://media-service:8006"),
		},
		"match": {
			Name: "match-service",
			URL:  getEnvOrDefault("MATCH_SERVICE_URL", "http://match-service:8003"),
		},
		"chat": {
			Name: "chat-service",
			URL:  getEnvOrDefault("CHAT_SERVICE_URL", "http://chat-service:8004"),
		},
		"notify": {
			Name: "notify-service",
			URL:  getEnvOrDefault("NOTIFY_SERVICE_URL", "http://notify-service:8005"),
		},
	}
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getServicesStatus() map[string]string {
	status := make(map[string]string)
	for name, service := range services {
		status[name] = service.URL
	}
	return status
}
