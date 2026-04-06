package web

import (
	"fmt"
	"log/slog"
	"net/http"
	"time"
)

func CorrelationMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		correlationId := r.Header.Get("X-Correlation-Id")
		if correlationId == "" {
			correlationId = fmt.Sprintf("%d", time.Now().UnixNano())
		}
		w.Header().Set("X-Correlation-Id", correlationId)
		slog.Info("request", "method", r.Method, "path", r.URL.Path, "correlation_id", correlationId)
		next.ServeHTTP(w, r)
	})
}
