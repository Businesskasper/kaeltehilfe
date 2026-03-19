## Configuration

Configuration is managed through `appsettings.json` (production) and `appsettings.Development.json` (development). The development defaults match the automated dev setup from `./dev/docker-compose.yml`.

In production, `appsettings.json` is mounted into the container from `build/result/kaeltehilfe-api/config/appsettings.json` and can be adjusted without rebuilding the image.

### Authorization

| Key | Description | Dev default |
| --- | ----------- | ----------- |
| Authority | OpenID Connect authority URL. Must point to the Keycloak realm used for authentication. | `http://localhost:8050/realms/kaeltehilfe` |
| Audience | Expected JWT audience claim. | `account` |
| Client | Name of the Keycloak client for user authentication. Must match the client created in Keycloak. | `users` |
| ClientId | UUID of the user client. Used for role assignment and role mapping via the Keycloak admin API. Must match the `id` of the client in Keycloak. | `912a01de-e8f1-46da-8219-f724d8cde4fd` |
| ApiBaseUrl | Base URL for the Keycloak admin REST API. Used for user management (create, update, delete, role assignments). | `http://localhost:8050/admin/realms/kaeltehilfe` |
| MachineClient | Name of the Keycloak service account client. Used to obtain access tokens for admin API calls via client credentials grant. | `backend` |
| MachineClientSecretVar | Name of the environment variable that holds the machine client secret. The application reads the secret from this env var at startup. | `KC_CLIENT_SECRET` |

### Certificate settings

Certificate paths may be absolute or relative to the backend's content root. Relative paths are resolved automatically at startup, so the same configuration works on both Windows and Linux.

| Key | Description | Dev default |
| --- | ----------- | ----------- |
| RootCertPath | Path to the root CA `.pfx` file (with private key). Used to sign client certificates for X.509 authentication. | `../dev/certs/root-pfx/rootCa.pfx` |
| RootCertPasswordVar | Name of the environment variable that holds the `.pfx` file password. | `ROOT_CERT_PASSWORD` |
| ClientCertDir | Directory where generated client certificates are stored. | `../dev/certs/client` |
| CrlPath | Path to the certificate revocation list file. | `../dev/certs/crl/crl.pem` |

### Environment variables

The backend reads secrets from environment variables rather than config files. These must be set as system environment variables:

| Variable | Description |
| -------- | ----------- |
| `KC_CLIENT_SECRET` | Secret for the Keycloak machine client. Must match the secret configured in Keycloak for the service account client. |
| `ROOT_CERT_PASSWORD` | Password for the root CA `.pfx` file. Must match the password used when the certificate was generated. |

## Migrations
```
dotnet ef migrations add InitialMigration -o Application/Infrastructure/Database/Migrations
dotnet ef database update
```

## Working with spatial data
1. Install SQLITE3 cli with spatialite module
http://www.gaia-gis.it/gaia-sins/windows-bin-amd64/mod_spatialite-5.1.0-win-amd64.7z

2. Open the database
```
sqlite3 kaeltehilfeDatabase.db
```

3. Load the spatialite module and verify
```
.load mod_spatialite
Select spatialite_version()
```

4. Query spatial data
```
Select X(GeoLocation) as Long, X(GeoLocation) as Lat from Distributions;
or
Select AsText(GeoLocation) from Distributions;
```
