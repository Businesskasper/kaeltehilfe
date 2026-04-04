package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/Businesskasper/kaeltehilfe/kaeltehilfe-geo/api/internal/db"
	"github.com/Businesskasper/kaeltehilfe/kaeltehilfe-geo/api/internal/handlers"
	"github.com/Businesskasper/kaeltehilfe/kaeltehilfe-geo/api/internal/web"
)

func main() {
	params := getParams()

	setupLogger(params.logLevel)

	slog.Info("Starting geo service",
		"port", params.port,
		"issuer_url", params.issuerUrl,
		"allowed_origins", params.allowedOrigins,
	)

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

func setupLogger(levelStr string) {
	var level slog.Level
	switch strings.ToLower(levelStr) {
	case "debug":
		level = slog.LevelDebug
	case "warn", "warning":
		level = slog.LevelWarn
	case "error":
		level = slog.LevelError
	default:
		level = slog.LevelInfo
	}

	handler := slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: level})
	slog.SetDefault(slog.New(handler))
}

type params struct {
	port           int
	connStr        string
	issuerUrl      string
	allowedOrigins []string
	logLevel       string
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
	defaultConnStr := (&url.URL{
		Scheme:   "postgres",
		User:     url.UserPassword(dbUser, dbPassword),
		Host:     fmt.Sprintf("%s:%s", dbHost, dbPort),
		Path:     dbName,
		RawQuery: "sslmode=disable",
	}).String()

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
	logLevel := flag.String("log_level", envOrDefault("LOG_LEVEL", "info"), "Log level: debug, info, warn, error")
	flag.Parse()

	return &params{
		port:           *port,
		connStr:        *connStr,
		issuerUrl:      *issuerUrl,
		allowedOrigins: strings.Split(*allowedOrigins, ","),
		logLevel:       *logLevel,
	}
}
