package services

// ServiceConfig represents the configuration for an upstream service
type ServiceConfig struct {
	Name string
	URL  string
}

var services map[string]ServiceConfig

// InitServices initializes the service configuration map
func InitServices() {
	services = map[string]ServiceConfig{
		"auth": {
			Name: "auth-service",
			URL:  "http://auth-service:8001",
		},
		"user": {
			Name: "user-service",
			URL:  "http://user-service:8002",
		},
		"media": {
			Name: "media-service",
			URL:  "http://media-service:8006",
		},
		"match": {
			Name: "match-service",
			URL:  "http://match-service:8003",
		},
		"chat": {
			Name: "chat-service",
			URL:  "http://chat-service:8004",
		},
		"notify": {
			Name: "notify-service",
			URL:  "http://notify-service:8005",
		},
		"paiements": {
			Name: "paiements-service",
			URL:  "http://paiements-service:8085",
		},
	}
}

// GetService returns service configuration by name
func GetService(name string) (ServiceConfig, bool) {
	service, exists := services[name]
	return service, exists
}

// GetServicesStatus returns the status map of all configured services
func GetServicesStatus() map[string]string {
	status := make(map[string]string)
	for name, service := range services {
		status[name] = service.URL
	}
	return status
}
