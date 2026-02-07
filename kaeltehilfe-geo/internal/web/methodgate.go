package web

import (
	"net/http"
)

func MethodGate(method string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != method {
			http.Error(w, "method not allowed", http.StatusNotFound)
			return
		}

		next.ServeHTTP(w, r)
	})
}
