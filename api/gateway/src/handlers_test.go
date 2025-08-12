package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func withRouter(fn func(r *gin.Engine)) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(corsMiddleware())
	fn(r)
	return r
}

func TestCORS_NoOrigin_WildcardNoCredentials(t *testing.T) {
	r := withRouter(func(r *gin.Engine) {
		r.GET("/", func(c *gin.Context) { c.String(200, "ok") })
	})
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
	r := withRouter(func(r *gin.Engine) {
		r.GET("/", func(c *gin.Context) { c.String(200, "ok") })
	})
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
	r := withRouter(func(r *gin.Engine) {
		r.GET("/", func(c *gin.Context) { c.String(200, "ok") })
	})
	req := httptest.NewRequest(http.MethodOptions, "/", nil)
	req.Header.Set("Origin", "http://example.com")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Fatalf("expected 204 for preflight, got %d", w.Code)
	}
}
