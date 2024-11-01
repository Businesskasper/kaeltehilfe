# Build

> [!WARNING] TODO
> - Add documentation for secrets
>

> [!NOTE]
> For the initial deployment of services "proxy" and "keycloak" (from [docker-compose.yml](../build/result/docker/docker-compose.yml)), the build and deployment steps for "kaeltebus-api" and "ui" must be skipped, since both require configuration details from Keycloak and the NGINX Proxy Manager.
>
> Comment out both services in `build/result/docker/docker-compose.yml` and skip the steps "Backend" and "Frontend" in this document and in [the deployment documentation](./deploy.md)).
>
> After the successful configuration of the services "proxy" and "keycloak", build the backend and frontend as documented here and execute both services [deployment steps](./deploy.md)).

### Root certificate
Mobile clients must authenticate using a client certificate. Therefore a root certificate must be created, which allows the API to issue signed client certificates and Keycloak to verify those certificates.

To create a root certificate, run `build/certs/create-root-cert.ps1` ***with administrative privileges***. A .pfx file (certificate and private key) for the API will be placed in `build/result/api/cert` and a .ca (only the certificate) file for Keycloak will be placed in `build/result/keycloak/x509`. Either set the .pfx's import password in the scripts params block, or pass it as a SecureString parameter on execution.

> [!WARNING]  
> The .pfx file's import password must be set in the APIs containers environment variable `ROOT_CERT_PASSWORD` (see [Todo]()). The easiest way to achieve this is to overwrite the `ROOT_CERT_PASSWORD` key's value in `build/result/docker/.env`. Caution! Dollar signs need to be escaped in both docker-compose.yml and docker .env!

### Keycloak Theme
The project includes a theme for Keycloak which allows seamless integration into the frontend. Build the theme by running `build/keycloak-theme/build-keycloak-theme.ps1`. The created .jar file will be placed in `build/result/keycloak/themes`

### Backend
> [!IMPORTANT]  
> Execute this only AFTER Keycloak and NGINX have been configured.

Adjust values following values in `kaeltebus-backend/src/appsettings.json` according to your configured Keycloak service:
| Key                     | Value                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| Authorization.Authority | Link to your created realm                                                                  |
| Authorization.Client    | Name of your created client inside the realm                                                |
| Authorization.ClientId  | Id of your created client inside the realm. The Id can be read from the realms browser URL. |

Build the project and create a docker image by running `build/backend/build-backend.ps1`. The image will be placed in `build/result/docker/images`.

### Frontend
> [!IMPORTANT]  
> Execute this only AFTER Keycloak and NGINX have been configured.

Adjust values following values in `kaeltebus-frontend/.env.production` according to your configured Keycloak and NGINX services:
| Key                | Value                                                   |
| ------------------ | ------------------------------------------------------- |
| VITE_API_BASE_URL  | Route to your backend base URL (should end with "/api") |
| VITE_IDP_AUTHORITY | Link to your created realm                              |

Build the project and create a docker image by running `build/frontend/build-frontend.ps1`. The image will be placed in `build/result/docker/images`.
