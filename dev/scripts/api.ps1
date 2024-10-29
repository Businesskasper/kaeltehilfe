

function GetLocalToken([string]$username, [string]$password, [string]$realm, [string]$keycloakBaseUrl = "http://localhost:8050") {
    $authUrl = "$($keycloakBaseUrl)/realms/$($realm)/protocol/openid-connect/token"

    $authBody = @{
        grant_type='password'
        username=$username
        password=$password
        client_id='kaeltebus'
        scope='openid profile roles'
    }
    $tokenResult = Invoke-WebRequest -Method POST -Uri $authUrl -ContentType "application/x-www-form-urlencoded" -Body $authBody | ConvertFrom-Json
    $token = $tokenResult | select -ExpandProperty access_token
    return $token
}

$realm = "drk"
$username = "lukat.weis@gmail.com"
$password = "Passw0rd"

$token = GetLocalToken -username $username -password $password -realm $realm


function GetLogins([string]$baseUrl, [string]$token) {

    $url = "$($baseUrl)/logins"

    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -Method Get -Headers @{Authorization = "Bearer $($token)"} 

    return ($response | ConvertFrom-Json)
}

function UpdateLogin([string]$username, [PSCustomObject]$update, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/logins/$($username)"

    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -Method Patch -Headers @{Authorization = "Bearer $($token)"} -Body ($update | ConvertTo-Json -Depth 99) -ContentType "application/json" 

    return $response
}

$baseUrl = "http://localhost:5280/api"

$logins = GetLogins -baseUrl $baseUrl -token $token

UpdateLogin -username $logins[0].username -update ([PSCustomObject]@{firstname = "Lukas"}) -baseUrl $baseUrl -token $token

<#
$endpoint = "logins/lukat.weis"

$body = @{
    registrationNumber = "UL-ABCD"
    role = "Operator"
}

Invoke-WebRequest -Uri "$($baseUrl)/$($endpoint)" -UseBasicParsing -Method Put -Headers @{Authorization = "Bearer $($token)"} -Body ($body | ConvertTo-Json -Depth 99) -ContentType "application/json"
#>