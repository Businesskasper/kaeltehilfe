## Configuration

Configuration is loaded at runtime from `/config.json`. In development, Vite serves this from `public/config.json`. In production, the Docker entrypoint generates it from environment variables.

| Key | Description | Dev default |
| --- | ----------- | ----------- |
| API_BASE_URL | Base URL of the kaeltehilfe backend API. | `http://localhost:5280/api` |
| IDP_AUTHORITY | OpenID Connect authority URL. Must point to the Keycloak realm used for authentication. Corresponds to `Authorization.Authority` in the backend config. | `http://localhost:8050/realms/kaeltehilfe` |
| IDP_CLIENT | Keycloak client ID for user authentication. Uses a predetermined UUID that must match `Authorization.ClientId` in the backend config. | `1763548e-b895-42e5-bb5f-a912512d36bd` |
| API_GEO_URL | Base URL of the kaeltehilfe geo service API. | `http://localhost:8083` |

### Development

Edit `public/config.json` for local overrides. The checked-in defaults match the automated dev setup from `dev/docker-compose.yml`.

### Production

The production Docker image generates `config.json` at container startup from environment variables (`API_BASE_URL`, `IDP_AUTHORITY`, `IDP_CLIENT`, `API_GEO_URL`). These are set in the `ui` service in `docker-compose.yml`. The image is deployment-agnostic — no URLs are baked in at build time.
