$userName = "max.mustermann@gmail.com"
$password = "Passw0rd" | ConvertTo-SecureString -AsPlainText -Force
$realmName = "kaeltehilfe"
$clientId = "users"
$baseUrl = "http://localhost:8050"

$tokenCache = [TokenCache]::new($userName, $password, $realmName, $clientId, $baseUrl)


try {
    $result = $null
    $response = $null
    $err = $null
    $headers = @{
        Authorization = "Bearer $($tokenCache.GetToken())"
    }
    $response = Invoke-WebRequest -Method GET -Uri "http://localhost:8083/address?lat=48.396065169875015&lng=9.993111692883389" -Headers $headers -UseBasicParsing  -ErrorAction Stop
    Write-Host $response.StatusCode
    $result = $response | ConvertFrom-Json
    $result
}
catch [Exception] {
    $err = $_
    Write-Host $err.Exception.Response.StatusCode.value__
}