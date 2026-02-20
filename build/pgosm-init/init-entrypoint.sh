#!/bin/bash
set -e

# until pg_isready -p 5432 -U "$POSTGRES_USER"; do
#   echo "Wait for postgres"
#   sleep 1
# done

psql_cmd=(
  psql
  -h "$POSTGRES_HOST"
  -p "$POSTGRES_PORT"
  -U "$POSTGRES_USER"
  -d "$POSTGRES_DB"
  -v ON_ERROR_STOP=1
)

status=""

if PGPASSWORD="$POSTGRES_PASSWORD" "${psql_cmd[@]}" -tAc "
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'osm'
    AND table_name   = 'pgosm_flex'
  LIMIT 1;
" | grep -q 1; then

  # 2) Nur dann Status abfragen
  status=$(
    PGPASSWORD="$POSTGRES_PASSWORD" "${psql_cmd[@]}" -tAc "
      SELECT import_status
      FROM osm.pgosm_flex;
    "
  )
fi

if [[ -z "$status" || "$status" == "Initializing" ]]; then
  echo "Import not yet completed - run init-import.sh"
  /usr/local/bin/init-import.sh
  echo "Write status for future runs to \"$STATUS_FILE\""
  mkdir -p "$(dirname "$STATUS_FILE")"
  touch "$STATUS_FILE"
else
  echo "Import already completed - skip"
fi

wait
