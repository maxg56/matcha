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
	database.AutoMigrate(&models.Users{}, &models.PasswordReset{})

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
				"username":          "testuser",
				"email":             "test@example.com",
				"password":          "password123",
				"first_name":        "Test",
				"last_name":         "User",
				"birth_date":        "1990-01-15",
				"gender":            "man",
				"sex_pref":          "both",
				"relationship_type": "long_term",
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
				"username":          "testuser", // same as first test
				"email":             "different@example.com",
				"password":          "password123",
				"first_name":        "Another",
				"last_name":         "User",
				"birth_date":        "1985-05-20",
				"gender":            "woman",
				"sex_pref":          "man",
				"relationship_type": "short_term",
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
	user := models.Users{
		Username:         "loginuser",
		Email:            "login@example.com",
		PasswordHash:     "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
		FirstName:        "Login",
		LastName:         "User",
		BirthDate:        time.Date(1990, 1, 1, 0, 0, 0, 0, time.UTC),
		Gender:           string(types.GenderMale),
		SexPref:          string(types.SexPrefBoth),
		RelationshipType: "long_term",
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
				"login":    "loginuser",
				"password": "password",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name: "valid login with email",
			payload: map[string]interface{}{
				"login":    "login@example.com",
				"password": "password",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name: "invalid password",
			payload: map[string]interface{}{
				"login":    "loginuser",
				"password": "wrongpassword",
			},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name: "nonexistent user",
			payload: map[string]interface{}{
				"login":    "nonexistent",
				"password": "password",
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

func TestForgotPasswordHandler(t *testing.T) {
	db.DB = setupTestDB()
	router := setupTestRouter()

	tests := []struct {
		name       string
		payload    map[string]interface{}
		statusCode int
		setupUser  bool
	}{
		{
			name: "valid email with existing user",
			payload: map[string]interface{}{
				"email": "test@example.com",
			},
			statusCode: http.StatusOK,
			setupUser:  true,
		},
		{
			name: "valid email with non-existing user",
			payload: map[string]interface{}{
				"email": "nonexistent@example.com",
			},
			statusCode: http.StatusOK, // Should still return OK for security
			setupUser:  false,
		},
		{
			name: "invalid email format",
			payload: map[string]interface{}{
				"email": "invalid-email",
			},
			statusCode: http.StatusBadRequest,
			setupUser:  false,
		},
		{
			name: "missing email",
			payload: map[string]interface{}{},
			statusCode: http.StatusBadRequest,
			setupUser: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup user if needed
			if tt.setupUser {
				user := models.Users{
					Username:     "testuser",
					FirstName:    "Test",
					LastName:     "User",
					Email:        tt.payload["email"].(string),
					PasswordHash: "$2a$10$abcdefg", // dummy hash
					BirthDate:    time.Now().AddDate(-25, 0, 0),
					Gender:       "male",
					SexPref:      "both",
					RelationshipType: "serious",
				}
				db.DB.Create(&user)
				defer db.DB.Delete(&user)
			}

			jsonBytes, _ := json.Marshal(tt.payload)
			req, _ := http.NewRequest("POST", "/api/v1/auth/forgot-password", bytes.NewBuffer(jsonBytes))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.statusCode, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			if tt.statusCode == http.StatusOK {
				assert.Equal(t, true, response["success"])
				data := response["data"].(map[string]interface{})
				// Message should contain password reset text regardless of user existence 
				message := data["message"].(string)
				assert.True(t, strings.Contains(message, "password reset") || strings.Contains(message, "Password reset"))
			} else {
				assert.Equal(t, false, response["success"])
				assert.NotEmpty(t, response["error"])
			}
		})
	}
}

func TestResetPasswordHandler(t *testing.T) {
	db.DB = setupTestDB()
	router := setupTestRouter()

	// Setup test user
	user := models.Users{
		Username:     "testuser",
		FirstName:    "Test", 
		LastName:     "User",
		Email:        "test@example.com",
		PasswordHash: "$2a$10$abcdefg", // dummy hash
		BirthDate:    time.Now().AddDate(-25, 0, 0),
		Gender:       "male",
		SexPref:      "both",
		RelationshipType: "serious",
	}
	db.DB.Create(&user)
	defer db.DB.Delete(&user)

	// Create valid reset token
	validToken := models.PasswordReset{
		UserID:    user.ID,
		Token:     "valid-token-123",
		ExpiresAt: time.Now().Add(time.Hour),
		Used:      false,
	}
	db.DB.Create(&validToken)
	defer db.DB.Delete(&validToken)


	// Create expired token
	expiredToken := models.PasswordReset{
		UserID:    user.ID,
		Token:     "expired-token-123",
		ExpiresAt: time.Now().Add(-time.Hour), // expired 1 hour ago
		Used:      false,
	}
	db.DB.Create(&expiredToken)
	defer db.DB.Delete(&expiredToken)

	// Create used token
	usedToken := models.PasswordReset{
		UserID:    user.ID,
		Token:     "used-token-123",
		ExpiresAt: time.Now().Add(time.Hour),
		Used:      true,
	}
	db.DB.Create(&usedToken)
	defer db.DB.Delete(&usedToken)

	tests := []struct {
		name       string
		payload    map[string]interface{}
		statusCode int
	}{
		{
			name: "valid token and password",
			payload: map[string]interface{}{
				"token":        "valid-token-123",
				"new_password": "newpassword123",
			},
			statusCode: http.StatusOK,
		},
		{
			name: "expired token",
			payload: map[string]interface{}{
				"token":        "expired-token-123",
				"new_password": "newpassword123",
			},
			statusCode: http.StatusBadRequest,
		},
		{
			name: "used token",
			payload: map[string]interface{}{
				"token":        "used-token-123",
				"new_password": "newpassword123",
			},
			statusCode: http.StatusBadRequest,
		},
		{
			name: "invalid token",
			payload: map[string]interface{}{
				"token":        "invalid-token",
				"new_password": "newpassword123",
			},
			statusCode: http.StatusBadRequest,
		},
		{
			name: "missing token",
			payload: map[string]interface{}{
				"new_password": "newpassword123",
			},
			statusCode: http.StatusBadRequest,
		},
		{
			name: "short password",
			payload: map[string]interface{}{
				"token":        "valid-token-123",
				"new_password": "short",
			},
			statusCode: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			jsonBytes, _ := json.Marshal(tt.payload)
			req, _ := http.NewRequest("POST", "/api/v1/auth/reset-password", bytes.NewBuffer(jsonBytes))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.statusCode, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			if tt.statusCode == http.StatusOK {
				assert.Equal(t, true, response["success"])
				data := response["data"].(map[string]interface{})
				assert.Contains(t, data["message"], "Password reset successful")
				
				// Verify token is marked as used
				var updatedToken models.PasswordReset
				token := tt.payload["token"].(string)
				db.DB.Where("token = ?", token).First(&updatedToken)
				assert.Equal(t, true, updatedToken.Used)
			} else {
				assert.Equal(t, false, response["success"])
				assert.NotEmpty(t, response["error"])
			}
		})
	}
}
