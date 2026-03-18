# Develop

## Prerequisites

### Docker
Install Docker Desktop (or a docker compose compatible service).

### SDKs
Depending on which services you want to work on, install the corresponding SDKs:

| Service | SDK |
| ------- | --- |
| Backend | [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) |
| Geo | [Go](https://go.dev/dl/) |
| Frontend | [Node.js](https://nodejs.org/) (LTS) |

### Keycloak theme
Build the keycloak theme as described in [build.md - Keycloak Theme](./build.md#keycloak-theme). Place the resulting `.jar` file in `./dev/keycloak/themes/`.

### OSM data
Download an `.osm.pbf` file from [Geofabrik](https://download.geofabrik.de/) and place it in `./dev/pgosm-init/input/`.

The default configuration expects `germany-latest.osm.pbf`. To use a different region, adjust `PGOSM_REGION`, `PGOSM_SUBREGION`, and `PGOSM_INPUT_FILE` in `./dev/docker-compose.yml`. See the [pgosm-flex documentation](https://pgosm-flex.com/common-customization.html) for details on available regions.

> [!NOTE]
> There is a known bug with hash checking when pgosm-init downloads `.pbf` files automatically. To avoid this, download and place the file manually as described above.


## Environment variables

Add `ROOT_CERT_PASSWORD` and `KC_CLIENT_SECRET` to `./dev/.env`:
```
ROOT_CERT_PASSWORD=<password-for-the-certificate>
KC_CLIENT_SECRET=<secret-for-the-machine-client>
```

| Variable | Description |
| -------- | ----------- |
| `ROOT_CERT_PASSWORD` | Protects the generated `.pfx` certificate. Used by `certs-init` during generation and by the backend at runtime to load the certificate. |
| `KC_CLIENT_SECRET` | Secret for the Keycloak machine-to-machine client (`backend`). Used by `keycloak-init` during setup and by the backend for service account authentication. |

Both variables must also be available as system environment variables so the backend can read them at runtime:
```powershell
[Environment]::SetEnvironmentVariable("ROOT_CERT_PASSWORD", "<password-for-the-certificate>", "Machine")
[Environment]::SetEnvironmentVariable("KC_CLIENT_SECRET", "<secret-for-the-machine-client>", "Machine")
```
Restart your shell after setting them.


## Setup

### Start the containers

```
cd ./dev
docker compose up
```

The `docker-compose.yml` defines the following services:

| Container | Purpose |
| --------- | ------- |
| **certs-init** | Generates a root CA certificate (`.crt` and `.pfx`). Skips if certificates already exist. |
| **keycloak** | Auth provider at http://localhost:8050. |
| **keycloak-init** | Creates realm, auth flows, clients, and an initial admin user. Skips existing resources. |
| **pgosm-db** | PostgreSQL with PostGIS at localhost:5432. |
| **pgosm-init** | Imports OSM data into pgosm-db. Skips if the database is already populated. |

The init containers run once and exit after completing. On subsequent starts they are idempotent and skip already existing resources.

### Keycloak resources created by keycloak-init

| Resource | Value |
| -------- | ----- |
| Realm | `kaeltehilfe` |
| User client | `users` |
| Machine client | `backend` (secret from `KC_CLIENT_SECRET`) |
| Browser auth flow | `x509` (set as default) |
| Initial admin user | `Max.Mustermann@gmail.com` (password from `APP_ADMIN_PASSWORD` in `.env`) |


## Start the services

All configuration defaults match the automated setup. See the README in each component for configuration details.

### Backend
```
cd ./kaeltehilfe-backend/src
dotnet watch
```

### Geo
Install [air](https://github.com/air-verse/air) for live reloading and resolve dependencies:
```
go install github.com/air-verse/air@latest
cd ./kaeltehilfe-geo
go mod tidy
air
```

### Frontend
Install dependencies and start the dev server:
```
cd ./kaeltehilfe-frontend
npm ci
npm run dev
```


## Manual setup

<details>
<summary>Alternative: manual certificate generation and Keycloak configuration</summary>

If you need more control over the setup or want to use a different realm configuration, you can perform the steps manually instead of relying on the init containers.

### Certificate generation

Generate a root CA certificate and place the output files in the expected directories:
- `.pfx` file (with private key) in `./dev/certs/root-pfx/`
- `.crt` file (public key only) in `./dev/certs/root-crt/`

The `certs-init` container will skip generation if these files already exist.

### Keycloak configuration

Start only the infrastructure containers (without init containers):
```
cd ./dev
docker compose up keycloak pgosm-db
```

Then configure Keycloak manually via the admin console at http://localhost:8050, following [deploy.md - Setup Keycloak](./deploy.md#setup-keycloak). You will need to create:
- A realm
- A user client with appropriate redirect URIs and web origins
- A machine client with service account roles for the admin API
- An X.509 browser authentication flow
- An initial admin user

Update `appsettings.Development.json` and `kaeltehilfe-frontend/.env` to match your manual configuration (realm name, client names, client UUIDs).

Either comment out `keycloak-init` from the `docker-compose.yml`, or adjust all values so that the container will skip all actions.

</details>
