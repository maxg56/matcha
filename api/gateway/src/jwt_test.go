package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
)

func signTestToken(sub string, secret string) (string, error) {
	claims := jwt.MapClaims{
		"sub": sub,
		"exp": time.Now().Add(1 * time.Hour).Unix(),
		"iat": time.Now().Add(-1 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func TestJWTMiddleware_RejectsWithoutToken(t *testing.T) {
	t.Setenv("JWT_SECRET", "testsecret")
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(jwtMiddleware())
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

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(jwtMiddleware())
	r.GET("/protected", func(c *gin.Context) {
		if v, exists := c.Get(ctxUserIDKey); !exists || v.(string) != "user-123" {
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
