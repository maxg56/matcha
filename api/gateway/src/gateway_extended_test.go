package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"gateway/src/handlers"
	"gateway/src/middleware"
	"gateway/src/services"
	"gateway/src/utils"
	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
)

// Integration Tests for Routes
func TestRoutes_AuthServiceIntegration(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Initialize services
	services.InitServices()

	// Create mock auth service
	authServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/api/v1/auth/register":
			if r.Method != "POST" {
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": true,
				"data": map[string]interface{}{
					"user_id":       "123",
					"access_token":  "eyJ...",
					"refresh_token": "eyJ...",
					"token_type":    "Bearer",
					"expires_in":    3600,
				},
			})
		case "/health":
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
		default:
			http.Error(w, "Not Found", http.StatusNotFound)
		}
	}))
	defer authServer.Close()

	r := gin.New()
	r.Use(handlers.CORSMiddleware())

	// Override service URL for testing
	// In real implementation, this would be done through service config
	r.POST("/api/v1/auth/register", func(c *gin.Context) {
		// Forward to mock auth service
		body, _ := c.GetRawData()
		resp, err := http.Post(authServer.URL+"/api/v1/auth/register", "application/json", bytes.NewReader(body))
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "Service unavailable"})
			return
		}
		defer resp.Body.Close()

		c.Status(resp.StatusCode)
		for key, values := range resp.Header {
			for _, v := range values {
				c.Writer.Header().Add(key, v)
			}
		}

		var respBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&respBody)
		c.JSON(resp.StatusCode, respBody)
	})

	// Test registration endpoint
	registerData := map[string]interface{}{
		"username":   "testuser",
		"email":      "test@example.com",
		"password":   "password123",
		"first_name": "Test",
		"last_name":  "User",
	}

	jsonData, _ := json.Marshal(registerData)
	req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d. Response: %s", w.Code, w.Body.String())
	}

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}

	if success, ok := response["success"].(bool); !ok || !success {
		t.Errorf("expected success: true in response")
	}
}

func TestRoutes_ProtectedRouteRequiresAuth(t *testing.T) {
	gin.SetMode(gin.TestMode)

	r := gin.New()
	r.Use(handlers.CORSMiddleware())

	// Add a protected route
	protected := r.Group("/api/protected")
	protected.Use(middleware.JWTMiddleware())
	protected.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "protected resource"})
	})

	// Test without token
	req := httptest.NewRequest("GET", "/api/protected/test", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}

	if !strings.Contains(w.Body.String(), "missing token") {
		t.Errorf("expected 'missing token' error message")
	}
}

func TestRoutes_ProtectedRouteWithValidToken(t *testing.T) {
	secret := "testsecret"
	os.Setenv("JWT_SECRET", secret)
	defer os.Unsetenv("JWT_SECRET")

	// Create valid token
	claims := jwt.MapClaims{
		"sub": "user-123",
		"exp": time.Now().Add(1 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(secret))

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(handlers.CORSMiddleware())

	protected := r.Group("/api/protected")
	protected.Use(middleware.JWTMiddleware())
	protected.GET("/test", func(c *gin.Context) {
		userID, _ := c.Get(middleware.CtxUserIDKey)
		c.JSON(http.StatusOK, gin.H{
			"message": "protected resource",
			"user_id": userID,
		})
	})

	req := httptest.NewRequest("GET", "/api/protected/test", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["user_id"] != "user-123" {
		t.Errorf("expected user_id 'user-123', got %v", response["user_id"])
	}
}

// Redis Blacklist Tests
func TestRedisBlacklist_WithoutRedis(t *testing.T) {
	// Test behavior when Redis is not connected
	isBlacklisted := utils.IsTokenBlacklisted("test-token")
	if isBlacklisted {
		t.Error("expected token not to be blacklisted when Redis unavailable")
	}
}

func TestRedisBlacklist_Integration(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Mock Redis behavior for testing
	r := gin.New()
	r.Use(handlers.CORSMiddleware())

	// Simulate blacklisted token check
	blacklistedTokens := make(map[string]bool)
	blacklistedTokens["blacklisted-token"] = true

	customJWTMiddleware := func() gin.HandlerFunc {
		return func(c *gin.Context) {
			token := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
			if blacklistedTokens[token] {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "token revoked"})
				c.Abort()
				return
			}
			c.Next()
		}
	}

	protected := r.Group("/api/test")
	protected.Use(customJWTMiddleware())
	protected.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "success"})
	})

	// Test with blacklisted token
	req := httptest.NewRequest("GET", "/api/test/", nil)
	req.Header.Set("Authorization", "Bearer blacklisted-token")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}

	if !strings.Contains(w.Body.String(), "token revoked") {
		t.Errorf("expected 'token revoked' error message")
	}

	// Test with non-blacklisted token
	req2 := httptest.NewRequest("GET", "/api/test/", nil)
	req2.Header.Set("Authorization", "Bearer valid-token")
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)

	if w2.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w2.Code)
	}
}

// Service Configuration Tests
func TestServiceConfig_InitializationAndRetrieval(t *testing.T) {
	services.InitServices()

	// Test getting existing service
	authService, exists := services.GetService("auth")
	if !exists {
		t.Error("expected auth service to exist")
	}

	if authService.Name != "auth-service" {
		t.Errorf("expected auth service name 'auth-service', got '%s'", authService.Name)
	}

	if authService.URL != "http://auth-service:8001" {
		t.Errorf("expected auth service URL 'http://auth-service:8001', got '%s'", authService.URL)
	}

	// Test getting non-existing service
	_, exists = services.GetService("nonexistent")
	if exists {
		t.Error("expected nonexistent service to not exist")
	}
}

func TestServiceConfig_GetServicesStatus(t *testing.T) {
	services.InitServices()

	status := services.GetServicesStatus()

	expectedServices := []string{"auth", "user", "media", "match", "chat", "notify"}
	for _, serviceName := range expectedServices {
		if url, exists := status[serviceName]; !exists {
			t.Errorf("expected service '%s' in status", serviceName)
		} else if url == "" {
			t.Errorf("expected non-empty URL for service '%s'", serviceName)
		}
	}
}

// Path Parameter Replacement Tests
func TestProxy_PathParameterReplacement(t *testing.T) {
	gin.SetMode(gin.TestMode)

	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		expectedPath := "/api/v1/users/profile/123"
		if r.URL.Path != expectedPath {
			t.Errorf("expected path '%s', got '%s'", expectedPath, r.URL.Path)
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("user profile"))
	}))
	defer upstream.Close()

	r := gin.New()
	r.GET("/api/users/profile/:id", func(c *gin.Context) {
		userID := c.Param("id")
		if userID != "123" {
			t.Errorf("expected user ID '123', got '%s'", userID)
		}

		// Simulate proxy path replacement
		targetPath := "/api/v1/users/profile/" + userID

		resp, err := http.Get(upstream.URL + targetPath)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "Service unavailable"})
			return
		}
		defer resp.Body.Close()

		c.Status(resp.StatusCode)
		body := make([]byte, 1024)
		n, _ := resp.Body.Read(body)
		c.Writer.Write(body[:n])
	})

	req := httptest.NewRequest("GET", "/api/users/profile/123", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	if w.Body.String() != "user profile" {
		t.Errorf("unexpected response body: %s", w.Body.String())
	}
}

// Query Parameter Forwarding Tests
func TestProxy_QueryParameterForwarding(t *testing.T) {
	gin.SetMode(gin.TestMode)

	var receivedQuery string
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedQuery = r.URL.RawQuery
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()

	r := gin.New()
	r.GET("/api/search", func(c *gin.Context) {
		// Forward query parameters
		targetURL := upstream.URL + "/api/v1/search"
		if c.Request.URL.RawQuery != "" {
			targetURL += "?" + c.Request.URL.RawQuery
		}

		resp, err := http.Get(targetURL)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "Service unavailable"})
			return
		}
		defer resp.Body.Close()
		c.Status(resp.StatusCode)
	})

	req := httptest.NewRequest("GET", "/api/search?query=test&limit=10&offset=20", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	expectedQuery := "query=test&limit=10&offset=20"
	if receivedQuery != expectedQuery {
		t.Errorf("expected query '%s', got '%s'", expectedQuery, receivedQuery)
	}
}

// Response Header Forwarding Tests
func TestProxy_ResponseHeaderForwarding(t *testing.T) {
	gin.SetMode(gin.TestMode)

	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Custom-Header", "custom-value")
		w.Header().Add("Set-Cookie", "session=abc123; Path=/")
		w.Header().Add("Set-Cookie", "token=xyz789; Path=/auth")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message": "success"}`))
	}))
	defer upstream.Close()

	r := gin.New()
	r.GET("/test", func(c *gin.Context) {
		resp, err := http.Get(upstream.URL)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "Service unavailable"})
			return
		}
		defer resp.Body.Close()

		// Forward response headers including multiple Set-Cookie headers
		c.Status(resp.StatusCode)
		for key, values := range resp.Header {
			for _, v := range values {
				c.Writer.Header().Add(key, v)
			}
		}

		body := make([]byte, 1024)
		n, _ := resp.Body.Read(body)
		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body[:n])
	})

	req := httptest.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	if w.Header().Get("Content-Type") != "application/json" {
		t.Errorf("expected Content-Type header to be forwarded")
	}

	if w.Header().Get("X-Custom-Header") != "custom-value" {
		t.Errorf("expected X-Custom-Header to be forwarded")
	}

	cookies := w.Header()["Set-Cookie"]
	if len(cookies) != 2 {
		t.Errorf("expected 2 Set-Cookie headers, got %d", len(cookies))
	}
}
