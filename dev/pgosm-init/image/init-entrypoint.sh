#!/bin/bash
set -e

# until pg_isready -p 5432 -U "$POSTGRES_USER"; do
#   echo "Wait for postgres"
#   sleep 1
# done

# TODO: check sql table instead
if [ ! -f "$STATUS_FILE" ]; then
  echo "Import not yet completed - run init-import.sh"
  /usr/local/bin/init-import.sh
  echo "Write status for future runs to \"$STATUS_FILE\""
  mkdir -p "$(dirname "$STATUS_FILE")"
  touch "$STATUS_FILE"
else
  echo "Import already completed - skip"
fi

wait
