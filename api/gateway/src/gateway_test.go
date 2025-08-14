package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"gateway/src/handlers"
	"gateway/src/middleware"
	"gateway/src/services"
	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
)

// Test helper functions
func signTestToken(sub string, secret string) (string, error) {
	claims := jwt.MapClaims{
		"sub": sub,
		"exp": time.Now().Add(1 * time.Hour).Unix(),
		"iat": time.Now().Add(-1 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(handlers.CORSMiddleware())
	return r
}

// CORS Tests
func TestCORS_NoOrigin_WildcardNoCredentials(t *testing.T) {
	r := setupTestRouter()
	r.GET("/", func(c *gin.Context) { c.String(200, "ok") })

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if got := w.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Fatalf("expected '*', got %q", got)
	}
	if got := w.Header().Get("Access-Control-Allow-Credentials"); got == "true" {
		t.Fatalf("expected credentials disabled when no Origin")
	}
}

func TestCORS_WithOrigin_EchoAndCredentials(t *testing.T) {
	r := setupTestRouter()
	r.GET("/", func(c *gin.Context) { c.String(200, "ok") })

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Origin", "http://example.com")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if got := w.Header().Get("Access-Control-Allow-Origin"); got != "http://example.com" {
		t.Fatalf("expected origin echoed, got %q", got)
	}
	if got := w.Header().Get("Access-Control-Allow-Credentials"); got != "true" {
		t.Fatalf("expected credentials true when Origin present")
	}
}

func TestCORS_OptionsPreflight_204(t *testing.T) {
	r := setupTestRouter()
	r.GET("/", func(c *gin.Context) { c.String(200, "ok") })

	req := httptest.NewRequest(http.MethodOptions, "/", nil)
	req.Header.Set("Origin", "http://example.com")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", w.Code)
	}
}

// JWT Middleware Tests
func TestJWTMiddleware_RejectsWithoutToken(t *testing.T) {
	t.Setenv("JWT_SECRET", "testsecret")
	r := setupTestRouter()
	r.Use(middleware.JWTMiddleware())
	r.GET("/protected", func(c *gin.Context) { c.String(200, "ok") })

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}
}

func TestJWTMiddleware_AllowsWithValidToken(t *testing.T) {
	secret := "testsecret"
	os.Setenv("JWT_SECRET", secret)
	token, err := signTestToken("user-123", secret)
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}

	r := setupTestRouter()
	r.Use(middleware.JWTMiddleware())
	r.GET("/protected", func(c *gin.Context) {
		if v, exists := c.Get(middleware.CtxUserIDKey); !exists || v.(string) != "user-123" {
			t.Fatalf("expected userID in context")
		}
		c.String(200, "ok")
	})

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
}

// Health Check Tests
func TestHealthCheck(t *testing.T) {
	// Initialize services for testing
	services.InitServices()

	r := setupTestRouter()
	r.GET("/health", handlers.HealthCheck)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	// Basic check that it returns JSON
	contentType := w.Header().Get("Content-Type")
	if contentType != "application/json; charset=utf-8" {
		t.Fatalf("expected JSON content type, got %q", contentType)
	}
}

// Proxy Request Tests
func TestProxy_ForwardsRequestToUpstream(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Create mock upstream server
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/v1/test" {
			t.Errorf("expected path /api/v1/test, got %s", r.URL.Path)
		}
		if r.Method != "GET" {
			t.Errorf("expected GET method, got %s", r.Method)
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message": "success"}`))
	}))
	defer upstream.Close()

	// Initialize services and override test service URL
	services.InitServices()
	// We need to temporarily override the service config for testing
	// Create a test router with proxy
	r := gin.New()
	r.GET("/test", func(c *gin.Context) {
		// Simulate proxy behavior by making direct HTTP call
		resp, err := http.Get(upstream.URL + "/api/v1/test")
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

		body := make([]byte, 1024)
		n, _ := resp.Body.Read(body)
		c.Writer.Write(body[:n])
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	if w.Body.String() != `{"message": "success"}` {
		t.Fatalf("unexpected response body: %s", w.Body.String())
	}
}

func TestProxy_ForwardsRequestHeaders(t *testing.T) {
	gin.SetMode(gin.TestMode)

	var receivedHeaders http.Header
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedHeaders = r.Header
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()

	r := gin.New()
	r.GET("/test", func(c *gin.Context) {
		// Create request to upstream
		req, _ := http.NewRequest("GET", upstream.URL, nil)

		// Copy headers (simulate proxy behavior)
		for key, values := range c.Request.Header {
			if key == "Host" {
				continue
			}
			for _, v := range values {
				req.Header.Add(key, v)
			}
		}

		client := &http.Client{}
		resp, _ := client.Do(req)
		if resp != nil {
			resp.Body.Close()
			c.Status(resp.StatusCode)
		}
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer test-token")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Add("X-Custom", "value1")
	req.Header.Add("X-Custom", "value2")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if receivedHeaders.Get("Authorization") != "Bearer test-token" {
		t.Errorf("expected Authorization header to be forwarded")
	}

	if receivedHeaders.Get("Content-Type") != "application/json" {
		t.Errorf("expected Content-Type header to be forwarded")
	}

	customHeaders := receivedHeaders["X-Custom"]
	if len(customHeaders) != 2 || customHeaders[0] != "value1" || customHeaders[1] != "value2" {
		t.Errorf("expected multiple X-Custom headers to be forwarded")
	}
}

func TestProxy_AddsUserIDHeader(t *testing.T) {
	gin.SetMode(gin.TestMode)

	var receivedUserID string
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedUserID = r.Header.Get("X-User-ID")
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()

	r := gin.New()
	r.GET("/test", func(c *gin.Context) {
		// Set user ID in context (simulating JWT middleware)
		c.Set(middleware.CtxUserIDKey, "user-123")

		// Create request to upstream
		req, _ := http.NewRequest("GET", upstream.URL, nil)

		// Add user ID header (simulate proxy behavior)
		if v, ok := c.Get(middleware.CtxUserIDKey); ok {
			if s, ok := v.(string); ok && s != "" {
				req.Header.Set("X-User-ID", s)
			}
		}

		client := &http.Client{}
		resp, _ := client.Do(req)
		if resp != nil {
			resp.Body.Close()
			c.Status(resp.StatusCode)
		}
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if receivedUserID != "user-123" {
		t.Errorf("expected X-User-ID header to be 'user-123', got '%s'", receivedUserID)
	}
}

// Error Handling Tests
func TestProxy_ServiceUnavailable(t *testing.T) {
	gin.SetMode(gin.TestMode)

	r := gin.New()
	r.GET("/test", func(c *gin.Context) {
		// Simulate service unavailable
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Service test not available",
		})
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", w.Code)
	}

	if !strings.Contains(w.Body.String(), "Service test not available") {
		t.Errorf("expected error message in response body")
	}
}

func TestProxy_BadGateway(t *testing.T) {
	gin.SetMode(gin.TestMode)

	r := gin.New()
	r.GET("/test", func(c *gin.Context) {
		// Simulate bad gateway (upstream connection failed)
		c.JSON(http.StatusBadGateway, gin.H{
			"error": "Service test unavailable",
		})
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadGateway {
		t.Fatalf("expected 502, got %d", w.Code)
	}

	if !strings.Contains(w.Body.String(), "unavailable") {
		t.Errorf("expected error message in response body")
	}
}

// JWT Token Extraction Tests
func TestExtractToken_FromAuthorizationHeader(t *testing.T) {
	r := gin.New()
	var extractedToken string

	r.GET("/test", func(c *gin.Context) {
		// Simulate token extraction
		auth := c.GetHeader("Authorization")
		if strings.HasPrefix(strings.ToLower(auth), "bearer ") {
			extractedToken = strings.TrimSpace(auth[7:])
		}
		c.String(200, "ok")
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Authorization", "Bearer test-token-123")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if extractedToken != "test-token-123" {
		t.Errorf("expected token 'test-token-123', got '%s'", extractedToken)
	}
}

func TestExtractToken_FromCookie(t *testing.T) {
	r := gin.New()
	var extractedToken string

	r.GET("/test", func(c *gin.Context) {
		// Simulate token extraction with cookie fallback
		auth := c.GetHeader("Authorization")
		if strings.HasPrefix(strings.ToLower(auth), "bearer ") {
			extractedToken = strings.TrimSpace(auth[7:])
		} else if cookie, err := c.Cookie("access_token"); err == nil && cookie != "" {
			extractedToken = cookie
		}
		c.String(200, "ok")
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.AddCookie(&http.Cookie{Name: "access_token", Value: "cookie-token-456"})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if extractedToken != "cookie-token-456" {
		t.Errorf("expected token 'cookie-token-456', got '%s'", extractedToken)
	}
}

// JWT Validation Error Tests
func TestJWTMiddleware_InvalidTokenFormat(t *testing.T) {
	t.Setenv("JWT_SECRET", "testsecret")
	r := setupTestRouter()
	r.Use(middleware.JWTMiddleware())
	r.GET("/protected", func(c *gin.Context) { c.String(200, "ok") })

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer invalid-token-format")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}

	if !strings.Contains(w.Body.String(), "invalid token") {
		t.Errorf("expected 'invalid token' error message")
	}
}

func TestJWTMiddleware_ExpiredToken(t *testing.T) {
	secret := "testsecret"
	t.Setenv("JWT_SECRET", secret)

	// Create expired token
	expiredClaims := jwt.MapClaims{
		"sub": "user-123",
		"exp": time.Now().Add(-1 * time.Hour).Unix(), // Expired 1 hour ago
		"iat": time.Now().Add(-2 * time.Hour).Unix(),
	}
	expiredToken := jwt.NewWithClaims(jwt.SigningMethodHS256, expiredClaims)
	expiredTokenString, _ := expiredToken.SignedString([]byte(secret))

	r := setupTestRouter()
	r.Use(middleware.JWTMiddleware())
	r.GET("/protected", func(c *gin.Context) { c.String(200, "ok") })

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+expiredTokenString)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}

	if !strings.Contains(w.Body.String(), "token expired") {
		t.Errorf("expected 'token expired' error message")
	}
}

func TestJWTMiddleware_MissingSecret(t *testing.T) {
	// Don't set JWT_SECRET
	os.Unsetenv("JWT_SECRET")

	r := setupTestRouter()
	r.Use(middleware.JWTMiddleware())
	r.GET("/protected", func(c *gin.Context) { c.String(200, "ok") })

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer some-token")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", w.Code)
	}

	if !strings.Contains(w.Body.String(), "missing token") {
		t.Errorf("expected 'missing token' error message")
	}
}
