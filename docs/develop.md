# Develop

### Prerequisites

##### DNS
Configure your local hosts file (or the equivalent in your OS) to resolve following DNS entries to 127.0.0.1:

| Entry             | Desciption             |
| ----------------- | ---------------------- |
| proxy.mydomain.de | NGINX Proxy Manager    |
| auth.mydomain.de  | Keycloak               |
| app.mydomain.de   | kaeltehilfe App Instance |

##### Docker
Install Docker Desktop (or a docker compose compatible service).

##### Certificates
Create following self signed certificates:
| Title                                                                  | Purpose                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dev/certs/root/rootCert.pfx                                            | Root certificate to issue and sign local SSL certificates for the browser and client certificates for login. For convenience, we create only one root certificate for both use cases. The certificate must be placed in a trusted certificate store. In Windows, import the certificate into "Trusted Root Certification Authorities" (no private key is required when importing). |
| dev/certs/ssl/proxy.crt, dev/certs/ssl/auth.crt, dev/certs/ssl/app.crt | Since clients use mTLS for authenticaiton, we need to protect all endpoints using SSL. For convencience, the certificates can be signed by above root certificate.                                                                                                                                                                                                                 |

All certificates can be created by running `. ./dev/scripts/create-certificates.ps1`.


### Background containers

Launching `./dev/docker-compose.yml` will run following containers:
- keycloak: Used for authentication and authorization
- pgosm-db: OSM database for the kaeltehilfe-go api
- pgosm-init: Imports OSM data to pgosm-db. The container will exit if the database has already been populated.

#### keycloak
Build the keycloak theme as described in [./build.md - Keycloak Theme](./build.md#keycloak-theme). Place the .jar file from the build result in `./dev/keycloak-themes/`.

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
Change directory to `./dev` and run `docker compose up`.