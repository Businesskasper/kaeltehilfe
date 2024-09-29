## Prepare host

## Setup docker

## Setup Nginx Proxy Manager

## Setup Keycloak

# Build and deploy

## Frontend
Run . frontend/build-frontend.ps1 to create a production build, create a docker image with nginx serving the content and export the image to ./images.
Copy the image to the docker host. Remove existing containers and images. Import the newly created image using "docker load -i kaeltebusui.tar".

## Backend
Run . backend/build-backend.ps1 to create a production build, create a docker image with kestrel serving the content and export the image to ./images.
Copy the image to the docker host. Remove existing containers and images. Import the newly created image using "docker load -i kaeltebusapi.tar".


