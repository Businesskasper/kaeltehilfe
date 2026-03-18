# Extracts response body from WebException for error details
function TryReadExceptionBody([System.Net.WebException]$ex) {
    $response = $ex.Response
    if ($null -eq $response) {
        return $null
    }
    $reader = [System.IO.StreamReader]::new($response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $responseBody = $reader.ReadToEnd()
    return $responseBody
}

# Creates a detailed Keycloak exception with response body if available
function CreateKcException([string]$message, [Exception]$innerException) {
    $details = $innerException.Message
    if ($innerException -is [System.Net.WebException]) {
        $responseBody = TryReadExceptionBody -ex $innerException
        if (-not [String]::IsNullOrWhiteSpace($responseBody)) {
            $details += "(Response Body: $($responseBody))" 
        }
    }
    return [Exception]::new("$($message): $($details)", $innerException)
}

# Retrieves access token using password grant flow
function GetToken([string]$username, [SecureString]$password, [string]$realmName, [string]$clientId, [string]$baseUrl) { 
    $authUrl = "$($baseUrl)/realms/$($realmName)/protocol/openid-connect/token"

    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $decodedPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)

    $body = @{
        grant_type = 'password'
        username = $username
        password = $decodedPassword
        client_id = $clientId
        scope = 'openid profile roles'
    }

    try {
        $response = Invoke-RestMethod -Method Post `
                                      -Uri $authUrl `
                                      -ContentType "application/x-www-form-urlencoded" `
                                      -Body $body 

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to retrieve token" -innerException $_.Exception)
    }
}

function GetTokenCache([string]$username, [SecureString]$password, [string]$realmName, [string]$clientId, [string]$baseUrl) {
    $tokenData = [PSCustomObject]@{
        access_token = ""
        expiresAt = $null
    }

    $sb = [scriptblock]::Create({
        $now = [DateTime]::Now
        if ($null -eq $tokenData -or $null -eq $tokenData.expiresAt -or $tokenData.expiresAt -le $now) {
            $token = GetToken -username $adminUsername -password $adminPassword -realmName $realmName -clientId $clientId -baseUrl $baseUrl
            $tokenData.access_token = $token.access_token
            $tokenData.expiresAt = $now.AddSeconds($token.expires_in)
        }
        return $tokenData.access_token
    })
    return $sb.GetNewClosure()
}

# Retrieves access token using client credentials grant
function GetClientToken([string]$clientName, [SecureString]$clientSecret, [string]$realmName, [string]$baseUrl) {
    $authUrl = "$($baseUrl)/realms/$($realmName)/protocol/openid-connect/token"

    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret)
    $decodedSecret = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)

    $authBody = @{
        client_id     = $clientName
        client_secret = $decodedSecret
        grant_type    = "client_credentials"
    }

    try {
        $response = Invoke-RestMethod -Method Post `
                                      -Uri $authUrl `
                                      -ContentType "application/x-www-form-urlencoded" `
                                      -Body $authBody 

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to retrieve client token" -innerException $_.Exception)
    }
}

class TokenCache {
    [string]$Username
    [SecureString]$Password
    [string]$RealmName
    [string]$ClientId
    [string]$BaseUrl

    [PSCustomObject]$TokenData

    TokenCache([string]$username, [SecureString]$password, [string]$realmName, [string]$clientId, [string]$baseUrl) {
        $this.Username = $username
        $this.Password = $password
        $this.RealmName = $realmName
        $this.ClientId = $clientId
        $this.BaseUrl = $baseUrl

        $this.TokenData = [PSCustomObject]@{
            access_token = ""
            expiresAt = $null
        }
    }

    [string] GetToken() {
        $now = [DateTime]::Now
        if ($null -eq $this.TokenData.expiresAt -or $this.TokenData.expiresAt -le $now) {
            $token = GetToken -username $this.Username -password $this.Password -realmName $this.RealmName -clientId $this.ClientId -baseUrl $this.BaseUrl
            $this.TokenData.access_token = $token.access_token
            $this.TokenData.expiresAt = $now.AddSeconds($token.expires_in)
        }
        return $this.TokenData.access_token
    }
}

#
# Server info
#

# Retrieves Keycloak server information
function GetServerInfo([string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/serverinfo"

    $headers = @{
        Authorization = "Bearer $($token)"
    }

    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get server info" -innerException $_.Exception)
    }
}

#
# Realm
#

# Lists all realms
function ListRealms([string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms"

    $headers = @{
        Authorization = "Bearer $($token)"
    }

    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to retrieve realms" -innerException $_.Exception)
    }
}

# Retrieves a specific realm
function GetRealm([string]$realmName, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)"

    $headers = @{
        Authorization = "Bearer $($token)"
    }

    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to retrieve realm" -innerException $_.Exception)
    }
}

# Creates a new realm
function CreateRealm([PSCustomObject]$realm, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms"

    $headers = @{
        Authorization = "Bearer $($token)"
        "Content-Type" = "application/json"
    }

    $body = $realm | ConvertTo-Json -Depth 100

    try {
        $response = Invoke-WebRequest -Method Post `
                                      -Uri $url `
                                      -Headers $headers `
                                      -Body $body `
                                      -UseBasicParsing

        $location = $response.Headers["Location"]
        $split = $location.Split("/")
        return $split[$split.Length -1]
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to create realm" -innerException $_.Exception)
    }
}

# Updates an existing realm
function UpdateRealm([string]$realmName, [PSCustomObject]$realm, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)"

    $headers = @{
        Authorization = "Bearer $($token)"
        "Content-Type" = "application/json"
    }

    $body = $realm | ConvertTo-Json -Depth 100

    try {
        Invoke-WebRequest -Method Put `
                          -Uri $url `
                          -Headers $headers `
                          -Body $body `
                          -UseBasicParsing | Out-Null
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to update realm" -innerException $_.Exception)
    }
}

# Updates the login theme for a realm
function UpdateUiExt([string]$realmName, [string]$theme, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/ui-ext"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    $body = [PSCustomObject]@{ loginTheme = $theme } | ConvertTo-Json -Depth 100

    try {
        Invoke-WebRequest -Method Put `
                          -Uri $url `
                          -Body $body `
                          -Headers $headers `
                          -ContentType "application/json" `
                          -UseBasicParsing | Out-Null
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to update ui ext" -innerException $_.Exception)
    }
}

#
# Auth Flow
#

# Lists authentication flows for a realm
function ListAuthFlows([string]$realmName, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/authentication/flows"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get auth flows" -innerException $_.Exception)
    }
}

# Copies an authentication flow
function CopyAuthFlow([string]$realmName, [string]$flowName, [PSCustomObject]$flow, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/authentication/flows/$($flowName)/copy"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    $body = $flow | ConvertTo-Json -Depth 100

    try {
        $response = Invoke-WebRequest -Method Post `
                                      -Uri $url `
                                      -Headers $headers `
                                      -Body $body `
                                      -ContentType "application/json" `
                                      -UseBasicParsing

        $location = $response.Headers["Location"]
        $split = $location.Split("/")
        return $split[$split.Length -1]
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to copy auth flow" -innerException $_.Exception)
    }
}

# Creates a new authentication flow
function CreateAuthFlow([string]$realmName, [PSCustomObject]$flow, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/authentication/flows"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    $body = $flow | ConvertTo-Json -Depth 100

    try {
        $response = Invoke-WebRequest -Method Post `
                                      -Uri $url `
                                      -Body $body `
                                      -Headers $headers `
                                      -ContentType "application/json" `
                                      -UseBasicParsing

        $location = $response.Headers["Location"]
        $split = $location.Split("/")
        return $split[$split.Length -1]
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to create auth flow" -innerException $_.Exception)
    }
}

# Creates a sub-flow within an authentication flow
function CreateAuthSubFlow([string]$realmName, [string]$parentFlow, [PSCustomObject]$subFlow, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/authentication/flows/$($parentFlow)/executions/flow"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    $body = $subFlow | ConvertTo-Json -Depth 100

    try {
        $response = Invoke-WebRequest -Method Post `
                                      -Uri $url `
                                      -Body $body `
                                      -Headers $headers `
                                      -ContentType "application/json" `
                                      -UseBasicParsing

        $location = $response.Headers["Location"]
        $split = $location.Split("/")
        return $split[$split.Length -1]
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to create auth sub flow" -innerException $_.Exception)
    }
}

# Deletes an authentication flow
function DeleteAuthFlow([string]$realmName, [string]$flowId, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/authentication/flows/$($flowId)"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    try {
        Invoke-RestMethod -Method Delete `
                          -Uri $url `
                          -Headers $headers `
                          -ContentType "application/json"
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to delete auth flow" -innerException $_.Exception)
    }
}

#
# Executions
#

# Lists executions for an authentication flow
function ListAuthFlowExecutions([string]$realmName, [string]$flowName, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/authentication/flows/$($flowName)/executions"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get flow executions" -innerException $_.Exception)
    }
}

# Creates an execution for an authentication flow
function CreateAuthFlowExecution([string]$realmName, [string]$flowName, [PSCustomObject]$execution, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/authentication/flows/$($flowName)/executions/execution"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    $body = $execution | ConvertTo-Json -Depth 100

    try {
        $response = Invoke-WebRequest -Method Post `
                                      -Uri $url `
                                      -Body $body `
                                      -Headers $headers `
                                      -ContentType "application/json" `
                                      -UseBasicParsing

        $location = $response.Headers["Location"]
        $split = $location.Split("/")
        return $split[$split.Length -1]
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to create auth flow execution for auth flow ""$($flowName)""" -innerException $_.Exception)
    }
}

# Deletes an authentication flow execution
function DeleteAuthFlowExecution([string]$realmName, [string]$executionId, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/authentication/executions/$($executionId)"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    try {
        Invoke-RestMethod -Method Delete `
                          -Uri $url `
                          -Headers $headers `
                          -ContentType "application/json"
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to delete execution" -innerException $_.Exception)
    }
}

# Updates an authentication flow execution
function UpdateAuthFlowExecution([string]$realmName, [string]$flowName, [PSCustomObject]$execution, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/authentication/flows/$($flowName)/executions"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    $body = $execution | ConvertTo-Json -Depth 100

    try {
        Invoke-WebRequest -Method Put `
                          -Uri $url `
                          -Body $body `
                          -Headers $headers `
                          -ContentType "application/json" `
                          -UseBasicParsing | Out-Null
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to update auth flow execution" -innerException $_.Exception)
    }
}

# Updates configuration for an authentication flow execution
function UpdateAuthFlowExecutionConfig([string]$realmName, [string]$executionId, [PSCustomObject]$config, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/authentication/executions/$($executionId)/config"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    $body = $config | ConvertTo-Json -Depth 100

    try {
        Invoke-WebRequest -Method Post `
                          -Uri $url `
                          -Body $body `
                          -Headers $headers `
                          -ContentType "application/json" `
                          -UseBasicParsing | Out-Null
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to update auth flow execution config" -innerException $_.Exception)
    }
}

#
# User profile
#

# Retrieves user profile configuration
function GetUserProfile([string]$realmName, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/users/profile"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get user profile" -innerException $_.Exception)
    }
}

# Updates user profile configuration
function UpdateUserProfile([string]$realmName, [PSCustomObject]$userProfile, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/users/profile"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    $body = $userProfile | ConvertTo-Json -Depth 100

    try {
        Invoke-WebRequest -Method Put `
                          -Uri $url `
                          -Body $body `
                          -Headers $headers `
                          -ContentType "application/json" `
                          -UseBasicParsing | Out-Null
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to update user profile" -innerException $_.Exception)
    }
}

#
# Client
#

# Lists clients in a realm
function ListClients([string]$realmName, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/clients"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get clients" -innerException $_.Exception)
    }
}

# Creates a new client
function CreateClient([string]$realmName, [PSCustomObject]$client, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/clients"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    $body = $client | ConvertTo-Json -Depth 100

    try {
        $response = Invoke-WebRequest -Method Post `
                                      -Uri $url `
                                      -Body $body `
                                      -Headers $headers `
                                      -ContentType "application/json" `
                                      -UseBasicParsing

        $location = $response.Headers["Location"]
        $split = $location.Split("/")
        return $split[$split.Length -1]
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to create client" -innerException $_.Exception)
    }
}

# Creates a role for a client
function CreateClientRole([string]$realmName, [string]$clientId, [PSCustomObject]$role, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/clients/$($clientId)/roles"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    $body = $role | ConvertTo-Json -Depth 100

    try {
        $response = Invoke-WebRequest -Method Post `
                                      -Uri $url `
                                      -Body $body `
                                      -Headers $headers `
                                      -ContentType "application/json" `
                                      -UseBasicParsing

        $location = $response.Headers["Location"]
        $split = $location.Split("/")
        return $split[$split.Length -1]
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to create role for client ""$($clientId)""" -innerException $_.Exception)
    }
}

#
# Client scope
#

# Lists client scopes in a realm
function ListClientScopes([string]$realmName, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/client-scopes"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get client scopes" -innerException $_.Exception)
    }
}

# Lists scope mappings for a client scope
function ListClientScopeMappings([string]$realmName, [string]$scopeId, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/client-scopes/$($scopeId)/scope-mappings"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get client scope mappings for scope ""$($scopeId)""" -innerException $_.Exception)
    }
}

# Lists default client scopes for a realm
function ListDefaultClientScopes([string]$realmName, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/default-default-client-scopes"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get default client scopes" -innerException $_.Exception)
    }
}

#
# Mappers
#

# Lists protocol mapper models for a client scope
function ListMapperModels([string]$realmName, [string]$scopeId, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/client-scopes/$($scopeId)/protocol-mappers/models"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get mappers" -innerException $_.Exception)
    }
}

# Retrieves a specific mapper model
function GetMapperModel([string]$realmName, [string]$scopeId, [string]$modelId, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/client-scopes/$($scopeId)/protocol-mappers/models/$($modelId)"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get mapper models for scope ""$($scopeId)"" and model ""$($modelId)""" -innerException $_.Exception)
    }
}

# Creates a protocol mapper model
function CreateMapperModel([string]$realmName, [string]$scopeId, [PSCustomObject]$mapper, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/client-scopes/$($scopeId)/protocol-mappers/models"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    $body = $mapper | ConvertTo-Json -Depth 100

    try {
        $response = Invoke-WebRequest -Method Post `
                                      -Uri $url `
                                      -Body $body `
                                      -Headers $headers `
                                      -ContentType "application/json" `
                                      -UseBasicParsing

        $location = $response.Headers["Location"]
        $split = $location.Split("/")
        return $split[$split.Length -1]
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to add mapper to profile scope ""$($scopeId)""" -innerException $_.Exception)
    }
}

# Updates a protocol mapper model
function UpdateClientScopeMapperModel([string]$realmName, [string]$scopeId, [string]$modelId, [PSCustomObject]$model, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/client-scopes/$($scopeId)/protocol-mappers/models/$($modelId)"

    $headers = @{
        Authorization = "Bearer $($token)"
        "Content-Type" = "application/json"
    }

    $body = $model | ConvertTo-Json -Depth 100

    try {
        Invoke-WebRequest -Method Put `
                          -Uri $url `
                          -Headers $headers `
                          -Body $body `
                          -UseBasicParsing | Out-Null
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to update mapper model for scope ""$($scopeId)"" and model ""$($modelId)""" -innerException $_.Exception)
    }
}

#
# Roles
#

# Lists roles for a client
function ListClientRoles([string]$realmName, [string]$clientId, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/clients/$($clientId)/roles"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get client roles for client ""$($clientId)""" -innerException $_.Exception)
    }
}

# Lists role mappings for a service account
function ListServiceAccountRoleMappings([string]$realmName, [string]$userId, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/users/$($userId)/role-mappings"

    $headers = @{
        Authorization = "Bearer $($token)"
    }

    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get role mappings for service account ""$($userId)""" -innerException $_.Exception)
    }
}

# Lists role mappings for a user in a client
function ListUserRoleMappings([string]$realmName, [string]$userId, [string]$clientId, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/users/$($userId)/role-mappings/clients/$($clientId)"

    $headers = @{
        Authorization = "Bearer $($token)"
    }

    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get role mappings for service account ""$($userId)"" and client ""$($clientId)""" -innerException $_.Exception)
    }
}

# Adds client roles to a service account
function AddServiceAccountClientRoles([string]$realmName, [string]$userId, [string]$clientId, [PSCustomObject[]]$roles, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/users/$($userId)/role-mappings/clients/$($clientId)"

    $headers = @{
        Authorization = "Bearer $($token)"
    }

    $body = $roles | ConvertTo-Json -Depth 100

    try {
        Invoke-WebRequest -Method Post `
                          -Uri $url `
                          -Body $body `
                          -Headers $headers `
                          -ContentType "application/json" `
                          -UseBasicParsing | Out-Null
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to assign client roles to service account ""$($userId)""" -innerException $_.Exception)
    }
}

#
# Users
#

# Retrieves the service account user for a client
function GetClientServiceAccountUser([string]$realmName, [string]$clientId, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/clients/$($clientId)/service-account-user"

    $headers = @{
        Authorization = "Bearer $($token)"
    }

    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get service account user for client ""$($clientId)""" -innerException $_.Exception)
    }
}

# Lists users in a realm
function ListUsers([string]$realmName, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/users"

    $headers = @{
        Authorization = "Bearer $($token)"
    }

    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json" `
                                      -UseBasicParsing

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get users" -innerException $_.Exception)
    }
}

# Creates a new user
function CreateUser([string]$realmName, [PSCustomObject]$user, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/users"

    $headers = @{
        Authorization = "Bearer $($token)"
    }

    $body = $user | ConvertTo-Json -Depth 100

    try {
        $response = Invoke-WebRequest -Method Post `
                                      -Uri $url `
                                      -Headers $headers `
                                      -Body $body `
                                      -ContentType "application/json" `
                                      -UseBasicParsing

        $location = $response.Headers["Location"]
        $split = $location.Split("/")
        return $split[$split.Length - 1]
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to create user" -innerException $_.Exception)
    }
}

# Sets the password for a user
function SetUserPassword([string]$realmName, [string]$userId, [SecureString]$password, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/users/$($userId)/reset-password"

    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $decodedPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)

    $headers = @{
        Authorization = "Bearer $($token)"
    }

    $body = [PSCustomObject]@{
        type = "password"
        value = $decodedPassword
        temporary = $false
    } | ConvertTo-Json -Depth 100

    try {
        Invoke-WebRequest -Method Put `
                          -Uri $url `
                          -Headers $headers `
                          -Body $body `
                          -ContentType "application/json" `
                          -UseBasicParsing | Out-Null
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to set password for user ""$($userId)""" -innerException $_.Exception)
    }
}

# Updates an existing user
function UpdateUser([string]$realmName, [string]$userId, [PSCustomObject]$user, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/users/$($userId)"

    $headers = @{
        Authorization = "Bearer $($token)"
    }

    $body = $user | ConvertTo-Json -Depth 100

    try {
        Invoke-WebRequest -Method Put `
                          -Uri $url `
                          -Headers $headers `
                          -Body $body `
                          -UseBasicParsing | Out-Null
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to update user ""$($userId)""" -innerException $_.Exception)
    }
}

function UpdateLogin([string]$loginId, [PSCustomObject]$login, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/logins/$($loginId)"

    $headers = @{
        Authorization = "Bearer $($token)"
    }

    $body = $login | ConvertTo-Json -Depth 100

    try {
        Invoke-WebRequest -Method Put `
                          -Uri $url `
                          -Headers $headers `
                          -Body $body `
                          -UseBasicParsing | Out-Null
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to update login ""$($loginId)""" -innerException $_.Exception)
    }
}

function AddUserClientRoles([string]$realmName, [string]$userId, [string]$clientId, [PSCustomObject[]]$roles, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/users/$($userId)/role-mappings/clients/$($clientId)"

    $headers = @{
        Authorization = "Bearer $($token)"
    }
    
    $body = $roles | ConvertTo-Json -Depth 100
    if ($roles.Count -eq 1) {
        $body = "[$($body)]"
    }

    try {
        Invoke-WebRequest -Method Post `
                          -Uri $url `
                          -Headers $headers `
                          -Body $body `
                          -ContentType "application/json" `
                          -UseBasicParsing | Out-Null
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to assign client roles to user ""$($userId)""" -innerException $_.Exception)
    }
}

# Lists client role mappings for a user
function ListUserClientRoleMappings([string]$realmName, [string]$userId, [string]$clientId, [string]$baseUrl, [string]$token) {
    $url = "$($baseUrl)/admin/realms/$($realmName)/users/$($userId)/role-mappings/clients/$($clientId)"

    $headers = @{
        Authorization = "Bearer $($token)"
    }

    try {
        $response = Invoke-RestMethod -Method Get `
                                      -Uri $url `
                                      -Headers $headers `
                                      -ContentType "application/json"

        return $response
    }
    catch [Exception] {
        throw (CreateKcException -message "Failed to get client role mappings for user ""$($userId)""" -innerException $_.Exception)
    }
}

function SetMemberSafe([PSCustomObject]$obj, [string]$memberName, [object]$value) {
    $member = $obj | Get-Member | ? { $_.Name -eq $memberName }
    if ($null -ne $member) {
        $obj.$($memberName) = $value
    }
    else {
        $obj | Add-Member -MemberType NoteProperty -Name $memberName -Value $value
    }
}