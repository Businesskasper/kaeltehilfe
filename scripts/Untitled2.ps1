cls

"9000"
Invoke-RestMethod -Method Get "http://localhost:9000/health/ready" -UseBasicParsing

"8050"
Invoke-RestMethod -Method Get "http://localhost:8050/health/ready" -UseBasicParsing

"8051"
Invoke-RestMethod -Method Get "http://localhost:8051/health/ready" -UseBasicParsing