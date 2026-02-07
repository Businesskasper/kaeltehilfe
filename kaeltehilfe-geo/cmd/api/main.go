package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/Businesskasper/kaeltehilfe/kaeltehilfe-geo/api/internal/db"
	"github.com/Businesskasper/kaeltehilfe/kaeltehilfe-geo/api/internal/handlers"
	"github.com/Businesskasper/kaeltehilfe/kaeltehilfe-geo/api/internal/web"
)

func main() {
	params := getParams()

	database, err := db.NewDatabase(context.Background(), params.connStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	srv := web.NewServer()

	corsConf := web.NewCors([]string{http.MethodGet}, []string{"authorization"}, params.allowedOrigins, true)
	srv.AddMiddleware(corsConf.CorsMiddleware)

	oidcAuth := web.NewOidcAuth(params.issuerUrl)
	srv.AddMiddleware(oidcAuth.AuthMiddleware)

	srv.RegisterRoute("/address", web.MethodGate(http.MethodGet, handlers.HandleAddressQuery(database)))

	err = srv.Listen(params.port)
	if err != nil {
		log.Fatalf("Failed to start server on port: %d", params.port)
	}
}

type params struct {
	port           int
	connStr        string
	issuerUrl      string
	allowedOrigins []string
}

func getParams() *params {
	defaultPort := 8086
	if envPort := os.Getenv("PORT"); envPort != "" {
		fmt.Sscanf(envPort, "%d", &defaultPort)
	}

	defaultConnStr := "postgres://admin:Passw0rd@localhost:5432/pgosm?sslmode=disable"
	if envConnStr := os.Getenv("DB_CONN_STR"); envConnStr != "" {
		defaultConnStr = envConnStr
	}

	defaultIssuerUrl := "http://localhost:8050/realms/drk"
	if envIssuerUrl := os.Getenv("ISSUER_URL"); envIssuerUrl != "" {
		defaultIssuerUrl = envIssuerUrl
	}

	defaultAllowedOrigins := "http://localhost:5173"
	if envAllowedOrigins := os.Getenv("ALLOWED_ORIGINS"); envAllowedOrigins != "" {
		defaultAllowedOrigins = envAllowedOrigins
	}

	port := flag.Int("port", defaultPort, "The port under which the api is served")
	connStr := flag.String("connection_string", defaultConnStr, "The database connection string")
	issuerUrl := flag.String("issuer_url", defaultIssuerUrl, "The oidc issuer url")
	allowedOrigins := flag.String("allowedOrigins", defaultAllowedOrigins, "The CORS allowed origins for the api")
	flag.Parse()

	return &params{
		port:           *port,
		connStr:        *connStr,
		issuerUrl:      *issuerUrl,
		allowedOrigins: strings.Split(*allowedOrigins, ","),
	}
}
