#!/bin/sh
cat <<EOF > /usr/share/nginx/html/config.json
{
  "API_BASE_URL": "${API_BASE_URL}",
  "IDP_AUTHORITY": "${IDP_AUTHORITY}",
  "IDP_CLIENT": "${IDP_CLIENT}",
  "API_GEO_URL": "${API_GEO_URL}"
}
EOF

exec nginx -g "daemon off;"
