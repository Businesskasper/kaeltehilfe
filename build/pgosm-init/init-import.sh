#!/usr/bin/env bash
set -euo pipefail

# Required env vars
: "${PGOSM_RAM:?PGOSM_RAM is required}"
: "${PGOSM_REGION:?PGOSM_REGION is required}"
: "${PGOSM_SUBREGION:?PGOSM_SUBREGION is required}"
: "${POSTGRES_HOST:?POSTGRES_HOST is required}"
: "${POSTGRES_PORT:?POSTGRES_PORT is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"

# Optional env vars
PGOSM_INPUT_FILE="${PGOSM_INPUT_FILE:-}"

psql_cmd=(
  psql
  -h "$POSTGRES_HOST"
  -p "$POSTGRES_PORT"
  -U "$POSTGRES_USER"
  -d "$POSTGRES_DB"
  -v ON_ERROR_STOP=1
)


# Ensure database exists
echo "Ensure database $POSTGRES_DB exists on $POSTGRES_HOST..."
PGPASSWORD="$POSTGRES_PASSWORD" "${psql_cmd[@]}" -d postgres <<SQL
DO
\$do\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '$POSTGRES_DB') THEN
      PERFORM dblink_exec('host=$POSTGRES_HOST user=$POSTGRES_USER password=$POSTGRES_PASSWORD', 'CREATE DATABASE $POSTGRES_DB');
   END IF;
END
\$do\$;
SQL

# Install required plugins first
echo "Install 1/2 extensions on remote database $POSTGRES_DB at $POSTGRES_HOST"
PGPASSWORD="$POSTGRES_PASSWORD" "${psql_cmd[@]}" <<SQL
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS hstore;
SQL

echo "Install 2/2 extensions on remote database $POSTGRES_DB at $POSTGRES_HOST"
PGPASSWORD="$POSTGRES_PASSWORD" "${psql_cmd[@]}" <<SQL
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
SQL

# Build import command with optional --input-file
cmd=(
  python3 /app/docker/pgosm_flex.py
  --ram="${PGOSM_RAM}"
  --region="${PGOSM_REGION}"
  --subregion="${PGOSM_SUBREGION}"
  --srid=4326
  --language=de
  --force
)

if [[ -n "$PGOSM_INPUT_FILE" ]]; then
  cmd+=( --input-file "$PGOSM_INPUT_FILE" )
fi

# Run pgosm import
echo "Run pgosm import:"
printf ' %q' "${cmd[@]}"
echo
"${cmd[@]}"

# Run all .sql scripts from /usr/local/bin/db-prep against database
INIT_DIR="/usr/local/bin/db-prep"

if [ -d "$INIT_DIR" ];then
  echo "Run SQL scripts from $INIT_DIR on remote database $POSTGRES_DB at $POSTGRES_HOST"
  for sql in "$INIT_DIR"/*.sql; do
    [ -f "$sql" ] || continue
    echo "Execute $sql..."
    PGPASSWORD="$POSTGRES_PASSWORD" "${psql_cmd[@]}" -f "$sql"
  done
else
  echo "No SQL scripts directory $INIT_DIR found - skip."
fi

echo "All SQL scripts executed successfully."