package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	db "auth-service/src/conf"
	"auth-service/src/handlers"
	models "auth-service/src/models"
	types "auth-service/src/types"
)

func setupTestDB() *gorm.DB {
	database, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to test database")
	}

	// Auto-migrate models
	database.AutoMigrate(&models.User{})

	return database
}

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	// Health check
	r.GET("/health", handlers.HealthCheckHandler)

	// API routes - same structure as main.go
	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.RegisterHandler)
			auth.POST("/login", handlers.LoginHandler)
			auth.POST("/logout", handlers.LogoutHandler)
			auth.POST("/refresh", handlers.RefreshTokenHandler)
			auth.GET("/verify", handlers.VerifyTokenHandler)
			auth.POST("/forgot-password", handlers.ForgotPasswordHandler)
			auth.POST("/reset-password", handlers.ResetPasswordHandler)
		}
	}

	return r
}

// generateTestToken creates a valid JWT token for testing
func generateTestToken(userID int) string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "test-secret-key" // Fallback for tests only
	}

	claims := jwt.MapClaims{
		"sub":     "1",
		"user_id": userID,
		"iat":     time.Now().Unix(),
		"exp":     time.Now().Add(time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(secret))
	return tokenString
}

func TestMain(m *testing.M) {
	// Set test environment variables
	os.Setenv("JWT_SECRET", "test-secret-key")
	os.Setenv("JWT_REFRESH_SECRET", "test-refresh-secret-key")
	os.Setenv("JWT_ACCESS_TTL", "15m")
	os.Setenv("JWT_REFRESH_TTL", "7d")

	// Setup test database
	db.DB = setupTestDB()

	// Run tests
	code := m.Run()
	os.Exit(code)
}

func TestRegisterHandler(t *testing.T) {
	router := setupTestRouter()

	tests := []struct {
		name           string
		payload        map[string]interface{}
		expectedStatus int
		expectedError  string
	}{
		{
			name: "valid registration",
			payload: map[string]interface{}{
				"username":   "testuser",
				"email":      "test@example.com",
				"password":   "password123",
				"first_name": "Test",
				"last_name":  "User",
				"birth_date": "1990-01-15",
				"gender":     "man",
				"sex_pref":   "both",
			},
			expectedStatus: http.StatusCreated,
		},
		{
			name: "missing required fields",
			payload: map[string]interface{}{
				"username": "testuser",
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "duplicate username",
			payload: map[string]interface{}{
				"username":   "testuser", // same as first test
				"email":      "different@example.com",
				"password":   "password123",
				"first_name": "Another",
				"last_name":  "User",
				"birth_date": "1985-05-20",
				"gender":     "woman",
				"sex_pref":   "man",
			},
			expectedStatus: http.StatusConflict,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			jsonPayload, _ := json.Marshal(tt.payload)
			req, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonPayload))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			if tt.expectedStatus == http.StatusCreated {
				assert.Equal(t, true, response["success"])
				data := response["data"].(map[string]interface{})
				assert.Contains(t, data, "access_token")
				assert.Contains(t, data, "refresh_token")
				assert.Equal(t, "Bearer", data["token_type"])
				assert.Contains(t, data, "expires_in")
			} else {
				assert.Equal(t, false, response["success"])
				assert.Contains(t, response, "error")
			}
		})
	}
}

func TestLoginHandler(t *testing.T) {
	router := setupTestRouter()

	// First create a test user
	user := models.User{
		Username:     "loginuser",
		Email:        "login@example.com",
		PasswordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
		Gender:       string(types.GenderMale),
		SexPref:      string(types.SexPrefBoth),
	}
	db.DB.Create(&user)

	tests := []struct {
		name           string
		payload        map[string]interface{}
		expectedStatus int
	}{
		{
			name: "valid login with username",
			payload: map[string]interface{}{
				"login": "loginuser",
				"password":   "password",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name: "valid login with email",
			payload: map[string]interface{}{
				"login": "login@example.com",
				"password":   "password",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name: "invalid password",
			payload: map[string]interface{}{
				"login": "loginuser",
				"password":   "wrongpassword",
			},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name: "nonexistent user",
			payload: map[string]interface{}{
				"login": "nonexistent",
				"password":   "password",
			},
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			jsonPayload, _ := json.Marshal(tt.payload)
			req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(jsonPayload))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			if tt.expectedStatus == http.StatusOK {
				assert.Equal(t, true, response["success"])
				data := response["data"].(map[string]interface{})
				assert.Contains(t, data, "access_token")
				assert.Contains(t, data, "refresh_token")
				assert.Equal(t, "Bearer", data["token_type"])
			} else {
				assert.Equal(t, false, response["success"])
				assert.Contains(t, response, "error")
			}
		})
	}
}

func TestVerifyTokenHandler(t *testing.T) {
	router := setupTestRouter()

	// Create a valid token
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":   "123",
		"iat":   now.Unix(),
		"nbf":   now.Unix(),
		"exp":   now.Add(15 * time.Minute).Unix(),
		"scope": "access",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	validToken, err := token.SignedString([]byte("test-secret-key"))
	require.NoError(t, err)

	tests := []struct {
		name           string
		authHeader     string
		expectedStatus int
	}{
		{
			name:           "valid token",
			authHeader:     "Bearer " + validToken,
			expectedStatus: http.StatusOK,
		},
		{
			name:           "missing authorization header",
			authHeader:     "",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "invalid token format",
			authHeader:     "Bearer invalidtoken",
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:           "malformed header",
			authHeader:     "InvalidFormat " + validToken,
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/api/v1/auth/verify", nil)
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			if tt.expectedStatus == http.StatusOK {
				assert.Equal(t, true, response["success"])
				data := response["data"].(map[string]interface{})
				assert.Equal(t, true, data["valid"])
				assert.Equal(t, "123", data["user_id"])
			} else {
				assert.Equal(t, false, response["success"])
				assert.Contains(t, response, "error")
			}
		})
	}
}

func TestRefreshTokenHandler(t *testing.T) {
	router := setupTestRouter()

	// Create a valid refresh token
	now := time.Now()
	refreshClaims := jwt.MapClaims{
		"sub":   "123",
		"iat":   now.Unix(),
		"nbf":   now.Unix(),
		"exp":   now.Add(7 * 24 * time.Hour).Unix(),
		"scope": "refresh",
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	validRefreshToken, err := refreshToken.SignedString([]byte("test-refresh-secret-key"))
	require.NoError(t, err)

	// Create an access token (wrong scope)
	accessClaims := jwt.MapClaims{
		"sub":   "123",
		"iat":   now.Unix(),
		"nbf":   now.Unix(),
		"exp":   now.Add(15 * time.Minute).Unix(),
		"scope": "access",
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	validAccessToken, err := accessToken.SignedString([]byte("test-secret-key"))
	require.NoError(t, err)

	tests := []struct {
		name           string
		payload        map[string]interface{}
		expectedStatus int
	}{
		{
			name: "valid refresh token",
			payload: map[string]interface{}{
				"refresh_token": validRefreshToken,
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "missing refresh token",
			payload:        map[string]interface{}{},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "invalid token",
			payload: map[string]interface{}{
				"refresh_token": "invalid.token.here",
			},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name: "wrong token scope (access token)",
			payload: map[string]interface{}{
				"refresh_token": validAccessToken,
			},
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			jsonPayload, _ := json.Marshal(tt.payload)
			req, _ := http.NewRequest("POST", "/api/v1/auth/refresh", bytes.NewBuffer(jsonPayload))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			if tt.expectedStatus == http.StatusOK {
				assert.Equal(t, true, response["success"])
				data := response["data"].(map[string]interface{})
				assert.Contains(t, data, "access_token")
				assert.Contains(t, data, "refresh_token")
				assert.Equal(t, "Bearer", data["token_type"])
				assert.Contains(t, data, "expires_in")
			} else {
				assert.Equal(t, false, response["success"])
				assert.Contains(t, response, "error")
			}
		})
	}
}

func TestLogoutHandler(t *testing.T) {
	router := setupTestRouter()

	tests := []struct {
		name           string
		token          string
		expectedStatus int
		expectedMsg    string
	}{
		{
			name:           "valid token logout",
			token:          "Bearer " + generateTestToken(1),
			expectedStatus: http.StatusOK,
			expectedMsg:    "logged out successfully",
		},
		{
			name:           "missing token",
			token:          "",
			expectedStatus: http.StatusUnauthorized,
			expectedMsg:    "missing bearer token",
		},
		{
			name:           "invalid token format",
			token:          "Bearer invalid-jwt",
			expectedStatus: http.StatusOK, // Graceful logout even with invalid token
			expectedMsg:    "logged out",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest("POST", "/api/v1/auth/logout", nil)
			if tt.token != "" {
				req.Header.Set("Authorization", tt.token)
			}

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			if tt.expectedStatus == http.StatusOK {
				assert.Equal(t, true, response["success"])
				data := response["data"].(map[string]interface{})
				assert.Contains(t, data["message"], tt.expectedMsg[:10]) // Partial match
			} else {
				assert.Equal(t, false, response["success"])
				assert.Contains(t, response, "error")
				assert.Equal(t, tt.expectedMsg, response["error"])
			}
		})
	}
}

func TestHealthCheck(t *testing.T) {
	router := setupTestRouter()

	req, _ := http.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	assert.Equal(t, true, response["success"])
	data := response["data"].(map[string]interface{})
	assert.Equal(t, "auth-service", data["service"])
	assert.Equal(t, "healthy", data["status"])
}
