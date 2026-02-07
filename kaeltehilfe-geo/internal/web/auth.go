package web

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/coreos/go-oidc/v3/oidc"
)

type OidcAuth struct {
	issuerUrl string
}

func NewOidcAuth(issuerUrl string) *OidcAuth {
	return &OidcAuth{issuerUrl: issuerUrl}
}

func (oidcAuth *OidcAuth) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !oidcAuth.isAuthorized(r) {
			http.Error(w, "Not authenticated!", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (oidcAuth *OidcAuth) isAuthorized(r *http.Request) bool {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		log.Println("No authorization token received!")
		return false
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[1] == "" {
		log.Println("Authorization header has bad format!")
		return false
	}
	authToken := parts[1]

	_, err := oidcAuth.verifiyToken(r.Context(), authToken)
	if err != nil {
		log.Println(err)
		return false
	}
	// No further claim must be inspected - everyone can use the geo service
	// TODO: maybe introduce some generic claim inspection as in .net api

	return true
}

func (oidcAuth *OidcAuth) verifiyToken(parentCtx context.Context, token string) (*oidc.IDToken, error) {
	// TODO: not sure if a dedicated ClientContext is required
	client := &http.Client{}
	ctx := oidc.ClientContext(parentCtx, client)

	provider, err := oidc.NewProvider(ctx, oidcAuth.issuerUrl)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	oidcConfig := &oidc.Config{
		// ClientID: "account",
		// checking the audience is not required, keycloak uses default audience "account" -> TODO: skip in .net api as well
		// see https://stackoverflow.com/questions/76349018/how-to-remove-account-from-aud-claim-in-keycloak
		SkipClientIDCheck: true,
		// SkipExpiryCheck:   true,
	}

	verifier := provider.Verifier(oidcConfig)
	return verifier.Verify(ctx, token)
}
