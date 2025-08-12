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
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	jwt "github.com/golang-jwt/jwt/v5"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	db "auth-service/src/conf"
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
	registerRoutes(r)
	return r
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
				"username": "testuser",
				"email":    "test@example.com",
				"password": "password123",
				"gender":   "man",
				"sex_pref": "both",
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
				"username": "testuser", // same as first test
				"email":    "different@example.com",
				"password": "password123",
				"gender":   "woman",
				"sex_pref": "man",
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
				assert.Equal(t, "success", response["status"])
				assert.Contains(t, response["data"], "user_id")
			} else {
				assert.Equal(t, "error", response["status"])
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
				"identifier": "loginuser",
				"password":   "password",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name: "valid login with email",
			payload: map[string]interface{}{
				"identifier": "login@example.com",
				"password":   "password",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name: "invalid password",
			payload: map[string]interface{}{
				"identifier": "loginuser",
				"password":   "wrongpassword",
			},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name: "nonexistent user",
			payload: map[string]interface{}{
				"identifier": "nonexistent",
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
				assert.Equal(t, "success", response["status"])
				data := response["data"].(map[string]interface{})
				assert.Contains(t, data, "access_token")
				assert.Contains(t, data, "refresh_token")
				assert.Equal(t, "Bearer", data["token_type"])
			} else {
				assert.Equal(t, "error", response["status"])
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
				assert.Equal(t, "success", response["status"])
				data := response["data"].(map[string]interface{})
				assert.Equal(t, true, data["valid"])
				assert.Equal(t, "123", data["user_id"])
			} else {
				assert.Equal(t, "error", response["status"])
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
			name: "missing refresh token",
			payload: map[string]interface{}{},
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
				assert.Equal(t, "success", response["status"])
				data := response["data"].(map[string]interface{})
				assert.Contains(t, data, "access_token")
				assert.Contains(t, data, "refresh_token")
				assert.Equal(t, "Bearer", data["token_type"])
				assert.Contains(t, data, "expires_in")
			} else {
				assert.Equal(t, "error", response["status"])
			}
		})
	}
}

func TestLogoutHandler(t *testing.T) {
	router := setupTestRouter()

	req, _ := http.NewRequest("POST", "/api/v1/auth/logout", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	assert.Equal(t, "success", response["status"])
	data := response["data"].(map[string]interface{})
	assert.Equal(t, "logged out", data["message"])
}

func TestHealthCheck(t *testing.T) {
	router := setupTestRouter()

	req, _ := http.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	assert.Equal(t, "success", response["status"])
	data := response["data"].(map[string]interface{})
	assert.Equal(t, "auth-service", data["service"])
	assert.Equal(t, true, data["ok"])
}
