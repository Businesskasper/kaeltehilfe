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

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getParams() *params {
	defaultPort := 8083
	if envPort := os.Getenv("PORT"); envPort != "" {
		fmt.Sscanf(envPort, "%d", &defaultPort)
	}

	dbUser := envOrDefault("DB_USER", "admin")
	dbPassword := envOrDefault("DB_PASSWORD", "Passw0rd")
	dbHost := envOrDefault("DB_HOST", "localhost")
	dbPort := envOrDefault("DB_PORT", "5432")
	dbName := envOrDefault("DB_NAME", "pgosm")
	defaultConnStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", dbUser, dbPassword, dbHost, dbPort, dbName)

	defaultIssuerUrl := "http://localhost:8050/realms/kaeltehilfe"
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
	allowedOrigins := flag.String("allowed_origins", defaultAllowedOrigins, "The CORS allowed origins for the api")
	flag.Parse()

	return &params{
		port:           *port,
		connStr:        *connStr,
		issuerUrl:      *issuerUrl,
		allowedOrigins: strings.Split(*allowedOrigins, ","),
	}
}
