# Develop

### Prerequisites

##### Docker
Install Docker Desktop (or a docker compose compatible service).

##### Signer certificate
You must generate a signer certificate so that the backend can sign client certificates and keycloak can validate them. 

You can use `./dev/scripts/create-signer-cert.ps1` to generate the certificate. 

The generated .pfx file contains a private key and is used by the backend to generate client certificates for authentication. The .ca file does not contain a private key and will be used by keycloak to validate the issued client certificates.

The location of the .pfx file and its password will be needed later when configuring the backend. The .ca file must later be mapped to the keycloak container.

### Background containers

`./dev/docker-compose.yml` contains following containers:
- keycloak: Auth provider for the application
- pgosm-db: OSM database for the kaeltehilfe-go api
- pgosm-init: Imports OSM data to pgosm-db on launch. The container will exit if the database has already been populated.

#### keycloak
Build the keycloak theme as described in [./build.md - Keycloak Theme](./build.md#keycloak-theme). Place the .jar file from the build result in `./dev/keycloak-themes/`.

The previously generated signer .ca certificate must be mapped to `/etc/x509/https` - place the file to `./dev/keycloak/x509`, in accordance to the `docker-compose.yml`

#### pgosm-db
Make sure the directory `./dev/pgosm-db/postgresql` exists and is empty. Note that PostgreSQL (and PostGIS) version 18+ do not accept mounted data directories. The configuration in `./dev/docker-compose.yml` is correct.

#### pgosm-init
The custom image is derived from "pgosm-flex/pgosm-flex". Some setup steps of the local PostGIS database are removed, since the image requires an external PostGIS connection (pgosm-db).
Make sure to adjust the environment variables `PGOSM_REGION` and `PGOSM_SUBREGION`, as documented on the [official website](https://pgosm-flex.com/common-customization.html).
Example configuration for "europe/germany/baden-wuerttemberg/tuebingen-regbez-260127.osm.pbf": 
```
PGOSM_REGION: europe/germany
PGOSM_SUBREGION: baden-wuerttemberg/tuebingen-regbez
```

> [!NOTE]
> There seems to be a bug with the hash checking when pgosm-init downloads the .pbf files. To prevent this, you can provide the container with the correct file prior to launching. Download the .pbf file from https://download.geofabrik.de/, set `PGOSM_REGION` and `PGOSM_SUBREGION` as well as `PGOSM_INPUT_FILE` with the path to the file on a mounted directory. For example: `/app/input/baden-wuerttemberg/tuebingen-regbez-latest.osm.pbf`
>

### Run the containers
Change the directory to `./dev` and run `docker compose up`.

### Configure Keycloak
Configure Keycloak as described in [./deploy.md - Keycloak Theme](./deploy.md#keycloak-theme)

### Backend
The backend requires a fully set up keycloak dev container and signer certificate (see previous steps).

#### Env vars
The backend requires set up environment variables. Note that the keys of the variables must correspond to `./kaeltehilfe-backend/src/appsettings.Development.json`. You can run the following powershell code *with administrative privileges* to set environment variables system wide. Restart your shell after using the commands:
```
[Environment]::SetEnvironmentVariable("KC_CLIENT_SECRET", "...", "Machine")
```

| Environment variable | appsettings.Development.json | Description |
| --- | ---------------------------- | ----------- |
| KC_CLIENT_SECRET | Authorization.MachineClientSecretVar | Client secret of the configured keycloak m2m client |
| ROOT_CERT_PASSWORD | RooCertificateSettings.RootCertPasswordVar | Password of the previously created signer ceritificate .pfx file |

#### Configuration
The backend must be configured in `./kaeltehilfe-backend/src/appsettings.Development.json`:

| Key | Description |
| --- | ----------- |
| Authorization.Authority | The authority url of the configured keycloak realm |
| Authorization.Client | The name of the configured keycloak client for user authentication |
|Authorization.ClientId | The clientId from the configured keycloak client for user authentication |
| Authorization.ApiBaseUrl | The base url for the keycloak admin API |
| Authorization.MachineClient | The name of the configured keycloak client for m2m communication |
| Authorization.MachineClientId | "" |
| Authorization.MachineClientSecretVar | The name of the previously configured environment variable that holds the secret for the machine client |
| CertificateSettings.RootCertPath | The path to the generated signer certificates .pfx file |
| CertificateSettings.RootCertPasswordVar | The name of the environment variable that holds the .pfx files password |
| CertificateSettings.ClientCertDir | The path to store generated client certificates for authentication |
| CertificateSettings.CrlPath | The path to generate and store the crl for deactivated client certificates for authentication |

#### Start
Run the api by navigating a shell to `./kaeltehilfe-backend/src` and invoking `dotnet watch` or `dotnet start`.


### Geo
#### Configuration
The geo service uses configuration defaults that fit the `./dev/docker-compose.yml`. To change the arguments for the dev server, add runtime arguments in `args_bin` or their corresponding environment variables.  

| Runtime argument | Environment variable | Description |
| ---------------- | -------------------- | ----------- |
| port | PORT | The port under which the webserver is provided |
| connection_string | DB_CONN_STR | The connection string to the pgosm database |
| issuer_url | ISSUER_URL | The issuer url to the configured keycloak client for user authentication |
| allowed_origins | ALLOWED_ORIGINS | The url of the frontend for CORS configuration |

#### Start
Run the api by navigating a shell to `./kaeltehilfe-geo` and invoking `air`.


### Frontend
#### Configuration
The configuration file `./kaeltehilfe-frontend/.env` has correct defaults for most configuration items, only `VITE_IDP_CLIENT` must be configured according to the keycloak setup.
| Key | Description |
| --- | ----------- |
| VITE_API_BASE_URL | The base url of the kaeltehilfe-backend api |
| VITE_IDP_AUTHORITY | The authority url of the configured keycloak realm |
| VITE_IDP_CLIENT | The name of the configured keycloak client for user authentication |
| VITE_API_GEO_URL | The base url of the kaeltehilfe-geo api |

#### Start
Run the frontend by navigating a shell to `./kaeltehilfe-frontend` and invoking `npm run dev`.

