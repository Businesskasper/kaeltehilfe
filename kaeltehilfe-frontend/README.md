## Configuration

Configuration is managed through `.env` (development) and `.env.production` (production). The development defaults match the automated dev setup from `./dev/docker-compose.yml`.

| Key | Description | Dev default |
| --- | ----------- | ----------- |
| VITE_API_BASE_URL | Base URL of the kaeltehilfe backend API. | `http://localhost:5280/api` |
| VITE_IDP_AUTHORITY | OpenID Connect authority URL. Must point to the Keycloak realm used for authentication. Corresponds to `Authorization.Authority` in the backend config. | `http://localhost:8050/realms/kaeltehilfe` |
| VITE_IDP_CLIENT | Name of the Keycloak client for user authentication. Must match the client name created in Keycloak. Corresponds to `Authorization.Client` in the backend config. | `users` |
| VITE_API_GEO_URL | Base URL of the kaeltehilfe geo service API. | `http://localhost:8083` |
