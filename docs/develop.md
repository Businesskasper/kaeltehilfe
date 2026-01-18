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

