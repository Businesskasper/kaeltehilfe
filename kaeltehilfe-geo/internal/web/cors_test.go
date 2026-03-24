package web

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCorsMiddleware_SetsHeadersOnRegularRequest(t *testing.T) {
	cors := NewCors(
		[]string{http.MethodGet},
		[]string{"authorization"},
		[]string{"http://localhost:5173"},
		true,
	)

	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handler := cors.CorsMiddleware(inner)
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusOK)
	}
	if got := rec.Header().Get("access-control-allow-origin"); got != "http://localhost:5173" {
		t.Errorf("allow-origin = %q, want %q", got, "http://localhost:5173")
	}
	if got := rec.Header().Get("access-control-allow-credentials"); got != "true" {
		t.Errorf("allow-credentials = %q, want %q", got, "true")
	}
}

func TestCorsMiddleware_HandlesPreflightOptions(t *testing.T) {
	cors := NewCors(
		[]string{http.MethodGet},
		[]string{"authorization", "content-type"},
		[]string{"http://localhost:5173", "http://example.com"},
		false,
	)

	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Error("inner handler should not be called for OPTIONS preflight")
	})

	handler := cors.CorsMiddleware(inner)
	req := httptest.NewRequest(http.MethodOptions, "/test", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusNoContent)
	}
	if got := rec.Header().Get("access-control-allow-methods"); got != "GET" {
		t.Errorf("allow-methods = %q, want %q", got, "GET")
	}
	if got := rec.Header().Get("access-control-allow-headers"); got != "authorization, content-type" {
		t.Errorf("allow-headers = %q, want %q", got, "authorization, content-type")
	}
	if got := rec.Header().Get("access-control-allow-credentials"); got != "false" {
		t.Errorf("allow-credentials = %q, want %q", got, "false")
	}
}

func TestCorsMiddleware_MultipleOrigins(t *testing.T) {
	cors := NewCors(
		[]string{http.MethodGet},
		[]string{},
		[]string{"http://a.com", "http://b.com"},
		true,
	)

	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handler := cors.CorsMiddleware(inner)
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if got := rec.Header().Get("access-control-allow-origin"); got != "http://a.com, http://b.com" {
		t.Errorf("allow-origin = %q, want %q", got, "http://a.com, http://b.com")
	}
}
