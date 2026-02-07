package web

import (
	"net/http"
	"strconv"
	"strings"
)

type Cors struct {
	methods          []string
	headers          []string
	oringins         []string
	allowCredentials bool
}

func NewCors(methods []string, headers []string, origins []string, allowCredentials bool) *Cors {
	return &Cors{
		methods:          methods,
		headers:          headers,
		oringins:         origins,
		allowCredentials: allowCredentials,
	}
}

func (cors *Cors) CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Always set acces-control-allow-origin and -credentials
		w.Header().Set("access-control-allow-origin", strings.Join(cors.oringins, ", "))
		w.Header().Set("access-control-allow-credentials", strconv.FormatBool(cors.allowCredentials))

		if r.Method == http.MethodOptions {
			w.Header().Set("access-control-allow-headers", strings.Join(cors.headers, ", "))
			w.Header().Set("access-control-allow-methods", strings.Join(cors.methods, ", "))
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
