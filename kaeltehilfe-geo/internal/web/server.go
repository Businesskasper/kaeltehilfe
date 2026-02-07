package web

import (
	"fmt"
	"log"
	"net/http"
)

type Server struct {
	mux        *http.ServeMux
	middleware []func(http.Handler) http.Handler
}

func NewServer() *Server {
	return &Server{mux: http.NewServeMux(), middleware: []func(http.Handler) http.Handler{}}
}

func (s *Server) AddMiddleware(mw func(http.Handler) http.Handler) {
	s.middleware = append(s.middleware, mw)
}

func (s *Server) RegisterRoute(path string, handler http.Handler) {
	for i := len(s.middleware) - 1; i >= 0; i-- {
		handler = s.middleware[i](handler)
	}
	s.mux.Handle(path, handler)
}

func (s *Server) Listen(port int) error {
	log.Printf("Server running on port %d", port)
	return http.ListenAndServe(fmt.Sprintf(":%d", port), s.mux)
}
