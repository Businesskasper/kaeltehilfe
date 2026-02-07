## Import
Running the ./docker/docker-compose.yaml will spin up postgis and a derived pgosm-flex image. The derived image will import the data on its first run only and create indices etc. on postgis.

##### Manual import
1. Run postgis/postgis and rustprooflabs/pgosm-flex as in the commented out section in ./docker/docker-compose.yaml
2. Trigger the import
```
docker exec -it pgosm python3 docker/pgosm_flex.py --ram=8 --region=europe/germany --subregion=baden-wuerttemberg/tuebingen-regbez --srid=4326 --language=de --force --input-file /app/output/baden-wuerttemberg/tuebingen-regbez-latest.osm.pbf
```

## Fix go packages
go clean -modcache
go clean -cache
go mod tidy

## Build
go build -C . -o ./dist/kaeltehilfe-geo-api.exe ./cmd/api