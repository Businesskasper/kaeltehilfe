## Tests

```
go test ./...
```

## Configuration

The geo service is configured via command-line flags or environment variables. Environment variables take precedence as defaults for the flags. All development defaults match the automated dev setup from `./dev/docker-compose.yml`.

| Flag | Environment variable | Description | Dev default |
| ---- | -------------------- | ----------- | ----------- |
| `-port` | `PORT` | Port the API server listens on. | `8083` |
| `-connection_string` | `DB_CONN_STR` | PostgreSQL connection string for the pgosm database. Must match the credentials configured in `docker-compose.yml`. | `postgres://admin:Passw0rd@localhost:5432/pgosm?sslmode=disable` |
| `-issuer_url` | `ISSUER_URL` | OpenID Connect issuer URL. Must point to the Keycloak realm used for authentication. Corresponds to `Authorization.Authority` in the backend config. | `http://localhost:8050/realms/kaeltehilfe` |
| `-allowed_origins` | `ALLOWED_ORIGINS` | Allowed origins for CORS. Must match the URL where the frontend is served. | `http://localhost:5173` |
| `-log_level` | `LOG_LEVEL` | Log level: `debug`, `info`, `warn`, `error`. In dev, `debug` enables per-request query logging. | `info` |

## Import
Running the `./docker/docker-compose.yaml` will spin up postgis and a derived pgosm-flex image. The derived image will import the data on its first run only and create indices etc. on postgis.

##### Manual import
1. Run postgis/postgis and rustprooflabs/pgosm-flex as in the commented out section in ./docker/docker-compose.yaml
2. Trigger the import
```
docker exec -it pgosm python3 docker/pgosm_flex.py --ram=8 --region=europe/germany --subregion=baden-wuerttemberg/tuebingen-regbez --srid=4326 --language=de --force --input-file /app/output/baden-wuerttemberg/tuebingen-regbez-latest.osm.pbf
```

## Fix go packages
```
go clean -modcache
go clean -cache
go mod tidy
```

## Build
```
go build -C . -o ./dist/kaeltehilfe-geo-api.exe ./cmd/api
```
