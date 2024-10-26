function GetAdminToken([string]$clientName = "kaeltebus-machine", [string]$clientSecret = $env:KC_CLIENT_SECRET, [string]$realm = "drk", [string]$keycloakBaseUrl = "http://localhost:8050") {
    $authUrl = "$($keycloakBaseUrl)/realms/$($realm)/protocol/openid-connect/token"

    $authBody = @{
        client_id     = $clientName
        client_secret = $clientSecret
        grant_type    = "client_credentials"
    }

    $tokenResponse = Invoke-RestMethod -Uri $authUrl -Method Post -ContentType "application/x-www-form-urlencoded" -Body $authBody

    return $tokenResponse.access_token
}

function getUsers([string]$realm, [string]$keycloakBaseUrl, [string]$token) {
    $url = "$($keycloakBaseUrl)/admin/realms/$($realm)/users"
    $headers = @{
        Authorization = "Bearer $($token)"
    }
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers

    return $response
}

function getUserRoleMappings([string]$realm, [string]$userId, [string]$clientId, [string]$token, [string]$keycloakBaseUrl) {
    $url = "$($keycloakBaseUrl)/admin/realms/$($realm)/users/$($userId)/role-mappings/clients/$($clientId)"
    $headers = @{
        Authorization = "Bearer $($token)"
    }
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers

    return $response
}

function updateUser([string]$userId, [PSCustomObject]$update) {
    $url = "$($keycloakBaseUrl)/admin/realms/$($realm)/users/$($userId)"
    $headers = @{
        Authorization = "Bearer $($token)"
    }
    $response = Invoke-RestMethod -Uri $url -Method Put -Headers $headers -Body ($update | ConvertTo-Json -Depth 99) -ContentType "application/json"

    return $response
}


$keycloakBaseUrl = "http://localhost:8050"
$realm = "drk"
$clientName = "kaeltebus"
$clientId = "23db6e13-d87d-4377-9dea-7d80ff13272c"

$token = GetAdminToken


$users = getUsers -realm $realm -keycloakBaseUrl $keycloakBaseUrl -token $token

$users[0].firstName = "Luka"
updateUser -userId $users[0].id -update ($users[0])

<#
$userRoleMappings = getUserRoleMappings -realm $realm -userId $users[0].id -clientId $clientId -token $token -keycloakBaseUrl $keycloakBaseUrl


$a = [DateTimeOffset]::FromUnixTimeMilliseconds($users[0].createdTimestamp)

1729888409306
1729888409


#>