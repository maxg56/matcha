package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestProxy_ForwardsMultipleRequestHeaders(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Capture headers received by upstream
	var receivedMulti []string
	var receivedAuth string

	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedMulti = r.Header["X-Multi"]
		receivedAuth = r.Header.Get("Authorization")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	}))
	defer upstream.Close()

	// Point service to upstream
	services = map[string]ServiceConfig{
		"t": {Name: "test", URL: upstream.URL},
	}

	r := gin.New()
	r.Any("/proxy", proxyRequest("t", "/echo"))

	req := httptest.NewRequest(http.MethodGet, "/proxy", nil)
	req.Header.Add("X-Multi", "a")
	req.Header.Add("X-Multi", "b")
	req.Header.Set("Authorization", "Bearer 123")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("unexpected status: %d", w.Code)
	}

	if len(receivedMulti) != 2 || receivedMulti[0] != "a" || receivedMulti[1] != "b" {
		t.Fatalf("expected two X-Multi header values, got: %#v", receivedMulti)
	}
	if receivedAuth != "Bearer 123" {
		t.Fatalf("expected Authorization to be forwarded, got %q", receivedAuth)
	}
}

func TestProxy_ForwardsMultipleSetCookieResponseHeaders(t *testing.T) {
	gin.SetMode(gin.TestMode)

	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.SetCookie(w, &http.Cookie{Name: "a", Value: "1"})
		http.SetCookie(w, &http.Cookie{Name: "b", Value: "2"})
		w.Header().Set("Content-Type", "text/plain")
		_, _ = w.Write([]byte("hello"))
	}))
	defer upstream.Close()

	services = map[string]ServiceConfig{
		"t": {Name: "test", URL: upstream.URL},
	}

	r := gin.New()
	r.Any("/proxy", proxyRequest("t", "/cookies"))

	req := httptest.NewRequest(http.MethodGet, "/proxy", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Validate both cookies are present
	cookies := w.Result().Cookies()
	if len(cookies) < 2 {
		t.Fatalf("expected 2 cookies, got %d", len(cookies))
	}
	// Map for easy lookup
	m := map[string]string{}
	for _, c := range cookies {
		m[c.Name] = c.Value
	}
	if m["a"] != "1" || m["b"] != "2" {
		t.Fatalf("expected cookies a=1 and b=2, got: %#v", m)
	}
}

func TestProxy_IncludesUserIDHeaderWhenAuthenticated(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Upstream checks X-User-ID header
	var gotUserID string
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotUserID = r.Header.Get("X-User-ID")
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()

	services = map[string]ServiceConfig{
		"t": {Name: "test", URL: upstream.URL},
	}

	r := gin.New()
	r.Use(func(c *gin.Context) { c.Set(ctxUserIDKey, "user-42"); c.Next() })
	r.Any("/proxy", proxyRequest("t", "/needs-user"))

	req := httptest.NewRequest(http.MethodGet, "/proxy", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if gotUserID != "user-42" {
		t.Fatalf("expected X-User-ID to be forwarded, got %q", gotUserID)
	}
}
