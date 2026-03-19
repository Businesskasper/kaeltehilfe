# Build

## Prerequisites

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or a docker compose compatible service). All images are built inside Docker — no local SDKs are required.

## Build order

All images are deployment-agnostic and can be built in any order. No URLs or environment-specific values are baked in at build time.

> [!NOTE]
> The NGINX Proxy Manager must be deployed and configured first so the public URLs are known. All other services (Keycloak realm, clients, users) are set up automatically by the init containers.

## Build images

Each build script creates a Docker image and exports it as a `.tar` file to `build/result/docker/images/`.

| Script | Image | Description |
| ------ | ----- | ----------- |
| `build\keycloak-theme\build-keycloak-theme.ps1` | — | Builds the Keycloak login theme `.jar` to `build/result/keycloak/themes/`. |
| `build\keycloak\build-keycloak.ps1` | `kaeltehilfe-keycloak` | Custom Keycloak image with health endpoint support. |
| `build\certs-init\build-certs-init.ps1` | `kaeltehilfe-certs-init` | Certificate generation init container. |
| `build\keycloak-init\build-keycloak-init.ps1` | `kaeltehilfe-keycloak-init` | Keycloak realm setup init container. |
| `build\backend\build-backend.ps1` | `kaeltehilfe-api` | .NET backend (multi-stage build). |
| `build\frontend\build-frontend.ps1` | `kaeltehilfe-ui` | Frontend (multi-stage build). |
| `build\geo\build-geo.ps1` | `kaeltehilfe-geo` | Geo service (multi-stage build). |
| `build\pgosm-init\build-pgosm-init.ps1` | `pgosm-init` | OSM data import init container. |


## Configuration

### Backend (`build/result/kaeltehilfe-api/config/appsettings.json`)

The backend configuration is mounted into the container at runtime and can be changed without rebuilding. A template is provided at `build/result/kaeltehilfe-api/config/appsettings.json`. Adjust the following values for your deployment:

| Key | Description |
| --- | ----------- |
| `Authorization.Authority` | Keycloak realm URL (e.g. `https://auth.example.com/realms/kaeltehilfe`). |
| `Authorization.ApiBaseUrl` | Keycloak admin API URL (e.g. `https://auth.example.com/admin/realms/kaeltehilfe`). |

The remaining values have sensible defaults. See the [backend README](../kaeltehilfe-backend/src/README.md) for details on all settings.

### Environment variables (`build/result/docker/.env`)

Fill in the values in `.env` before starting the services:

| Variable | Description |
| -------- | ----------- |
| `KEYCLOAK_ADMIN` | Keycloak bootstrap admin username. |
| `KEYCLOAK_ADMIN_PASSWORD` | Keycloak bootstrap admin password. |
| `KEYCLOAK_ISSUER_URL` | Full Keycloak realm URL (used by the geo service). |
| `KC_CLIENT_SECRET` | Secret for the machine-to-machine client (`backend`). |
| `ROOT_CERT_PASSWORD` | Password for the root CA `.pfx` file. |
| `KC_REALM` | Keycloak realm name (default: `kaeltehilfe`). |
| `KC_USER_CLIENT_ID` | Predetermined UUID for the user client. Pre-filled — do not change unless you also update `Authorization.ClientId` in the backend config. |
| `APP_DOMAIN` | Public domain for the application (e.g. `ulm.kaelte-hilfe.de`). Used to derive frontend config URLs. |
| `AUTH_DOMAIN` | Public domain for Keycloak (e.g. `auth.kaelte-hilfe.de`). Used to derive frontend config URLs. |
| `APP_URL` | Public frontend URL (used for Keycloak redirect URIs). |
| `APP_ADMIN_USERNAME` | Initial admin user email. |
| `APP_ADMIN_FIRSTNAME` | Initial admin user first name. |
| `APP_ADMIN_LASTNAME` | Initial admin user last name. |
| `APP_ADMIN_PASSWORD` | Initial admin user password. |
| `POSTGIS_ADMIN` | PostgreSQL admin username. |
| `POSTGIS_PASSWORD` | PostgreSQL admin password. |
| `POSTGIS_DB` | PostgreSQL database name. |
| `POSTGIS_CONN_STR` | Full PostgreSQL connection string for the geo service. |
| `ALLOWED_ORIGINS` | Allowed CORS origins for the backend and geo service. |

> [!WARNING]
> Dollar signs in passwords must be escaped in `.env` files (`$$`).
