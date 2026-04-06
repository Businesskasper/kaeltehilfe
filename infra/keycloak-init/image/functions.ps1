function Write-Log([string]$message, [System.ConsoleColor]$foregroundColor = [System.ConsoleColor]::White) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    Write-Host "[$timestamp] $message" -ForegroundColor $foregroundColor
}

# Sets up Keycloak realm and configurations for Kaeltehilfe
function SetupKaeltehilfeKeycloak {
    param (
        [Parameter(Mandatory=$true)]
        [string]$realmName,
        # Should be NONE for development on localhost, ALL for deployments
        [Parameter(Mandatory=$true)]
        [ValidateSet("NONE","ALL","EXTERNAL")]
        [string]$requireSsl,
        # Url of the application
        [Parameter(Mandatory=$true)]
        [string]$appUrl,
        # Defaults for using cli on default realm and admin-cli client
        [Parameter(Mandatory=$true)]
        [string]$adminUsername,
        [Parameter(Mandatory=$true)]
        [SecureString]$adminPassword,
        [Parameter(Mandatory=$true)]
        [string]$baseUrl,
        # Kaeltehilfe instance initial admin user
        [Parameter(Mandatory=$true)]
        [string]$appAdminUsername,
        [Parameter(Mandatory=$true)]
        [string]$appAdminFirstname,
        [Parameter(Mandatory=$true)]
        [string]$appAdminLastname,
        [Parameter(Mandatory=$true)]
        [SecureString]$appAdminPassword,
        # Secret for backend client
        [Parameter(Mandatory=$true)]
        [SecureString]$machineClientSecret,
        # Predetermined UUID for user client
        [Parameter(Mandatory=$true)]
        [string]$userClientId
    )

    #
    # Setup token cache
    #

    $adminClient = "admin-cli"
    $adminRealm = "master"
    $tokenCache = [TokenCache]::new($adminUsername, $adminPassword, $adminRealm, $adminClient, $baseUrl)


    # 
    # Create realm (with ssl requirements as defined)
    #

    $realms = ListRealms -baseUrl $baseUrl -token $tokenCache.GetToken()
    $existingRealm = $realms | ? { $_.realm -eq $realmName } | select -First 1
    if ($null -ne $existingRealm) {
        Write-Log"Realm $($realmName) already exists - skip creation"
    }
    else {
        Write-Log"Create realm ""$($realmName)"""
        $realm = [PSCustomObject]@{
            realm = $realmName
            enabled = $true
            sslRequired = $requireSsl
            ssoSessionIdleTimeout = 7200
        }
        CreateRealm -realm $realm -baseUrl $baseUrl -token $tokenCache.GetToken() | Out-Null
    }


    #
    # Create browser auth flow
    #

    $flowName = "x509"

    # Check if flow already exists to cancel execution
    $authFlows = ListAuthFlows -realmName $realmName -baseUrl $baseUrl -token $tokenCache.GetToken()
    $existingAuthFlow = $authFlows | ? { $_.alias -eq $flowName } | select -First 1 # Should not be possible since we just created the realm - just to be sure and for future flexibility
    if ($null -ne $existingAuthFlow) {
        Write-Log"Auth flow $($flowName) already exists - skip creation"
    }
    else {
        # Create flow
        $flow = [PSCustomObject]@{
          alias = $flowName
          description = "X509 login flow"
          providerId = "basic-flow"
          topLevel = $true
          builtIn = $false
        }
        Write-Log"Create auth flow ""$($flowName)"""
        $authFlowId = CreateAuthFlow -realmName $realmName -flow $flow -baseUrl $baseUrl -token $tokenCache.GetToken()

        # Add executions
        Write-Log"Add and configure execution ""auth-cookie"""
        $authCookieExec = [PSCustomObject]@{
            provider = "auth-cookie"
        }
        $authCookieExecId = CreateAuthFlowExecution -realmName $realmName -flowName $flowName -execution $authCookieExec -baseUrl $baseUrl -token $tokenCache.GetToken()
        $authCookieExecDetails = [PSCustomObject]@{
            id = $authCookieExecId
            requirement = "ALTERNATIVE"
            displayName = "Cookie"
            requirementChoices = @(
                "REQUIRED",
                "ALTERNATIVE",
                "DISABLED"
            )
            configurable = $false
            providerId = "auth-cookie"
            level = 0
            index = 0
            priority = 0
        }
        UpdateAuthFlowExecution -realmName $realmName -flowName $flowName -execution $authCookieExecDetails -baseUrl $baseUrl -token $tokenCache.GetToken()

        Write-Log"Add and configure execution ""auth-x509-client-username-form"""
        $x509CertExec = [PSCustomObject]@{
            provider = "auth-x509-client-username-form"
        }
        $x509CertExecId = CreateAuthFlowExecution -realmName $realmName -flowName $flowName -execution $x509CertExec -baseUrl $baseUrl -token $tokenCache.GetToken()
        $x509CertExecDetails = [PSCustomObject]@{
            id = $x509CertExecId
            configurable = $true
            displayName = "X509/Validate Username Form"    
            providerId = "auth-x509-client-username-form"
            requirement = "ALTERNATIVE"
            requirementChoices = @(
                "REQUIRED",
                "ALTERNATIVE",
                "DISABLED"
            )
            level = 0
            index = 1
            priority = 1
        }
        UpdateAuthFlowExecution -realmName $realmName -flowName $flowName -execution $x509CertExecDetails -baseUrl $baseUrl -token $tokenCache.GetToken()
        $x509CertExecConfig = [PSCustomObject]@{
            "alias" = "x509-validate-username-form"
            "config" = [PSCustomObject]@{
                "default.reference.value" = ""
                "default.reference.maxAge" = ""
                "x509-cert-auth.mapping-source-selection" = "Subject's Common Name"
                "x509-cert-auth.canonical-dn-enabled" = $false
                "x509-cert-auth.serialnumber-hex-enabled" = $false
                "x509-cert-auth.regular-expression" = "(.*?)(? =$)"
                "x509-cert-auth.mapper-selection" = "Username or Email"
                "x509-cert-auth.timestamp-validation-enabled" = $true
                "x509-cert-auth.crl-checking-enabled" = $true
                "x509-cert-auth.crl-relative-path" = "crl/crl.pem"
                "x509-cert-auth.crldp-checking-enabled" = $false
                "x509-cert-auth.ocsp-fail-open" = $false
                "x509-cert-auth.ocsp-responder-uri" = ""
                "x509-cert-auth.ocsp-responder-certificate" = ""
                "x509-cert-auth.keyusage" = ""
                "x509-cert-auth.extendedkeyusage" = ""
                "x509-cert-auth.certificate-policy" = ""
                "x509-cert-auth.certificate-policy-mode" = "All"
            }
        }
        UpdateAuthFlowExecutionConfig -realmName $realmName -executionId $x509CertExecId -config $x509CertExecConfig -baseUrl $baseUrl -token $tokenCache.GetToken()

        Write-Log"Add execution subflow ""x509 forms"""
        $x509FormExec = [PSCustomObject]@{
          alias = "x509 forms"
          type = "basic-flow"
          provider = "basic-flow"
        }
        $x509FormExecFlowId = CreateAuthSubFlow -realmName $realmName -parentFlow $flowName -subFlow $x509FormExec -baseUrl $baseUrl -token $tokenCache.GetToken()
        $allExecs = ListAuthFlowExecutions -realmName $realmName -flowName $flowName -baseUrl $baseUrl -token $tokenCache.GetToken()
        $x509Exec = $allExecs | ? { $_.flowId -eq $x509FormExecFlowId } | select -First 1
        $x509FormExecId = $x509Exec.id
        $x509FormExecDetails = [PSCustomObject]@{
            id = $x509FormExecId
            flowId = $x509FormExecFlowId
            requirement = "ALTERNATIVE"
            displayName = "x509 forms"
            description = "Username, password, otp and other auth forms."
            requirementChoices = @(
                "REQUIRED",
                "ALTERNATIVE",
                "DISABLED",
                "CONDITIONAL"
            )
            configurable = $false
            authenticationFlow = $true
            level = 0
            index = 2
            priority = 2
        }
        UpdateAuthFlowExecution -realmName $realmName -flowName $flowName -execution $x509FormExecDetails -baseUrl $baseUrl -token $tokenCache.GetToken()

        Write-Log"Add execution ""auth-username-password-form"" to subflow ""x509 forms"""
        $authFormExec = [PSCustomObject]@{
            provider = "auth-username-password-form"
        }
        $authFormExecId = CreateAuthFlowExecution -realmName $realmName -flowName $x509Exec.displayName -execution $authFormExec -baseUrl $baseUrl -token $tokenCache.GetToken() # Sicher mit displayName?
        $authFormExecDetails = [PSCustomObject]@{
            id = $authFormExecId
            flowId = $x509ExecFlowId
            requirement = "REQUIRED"
        }
        UpdateAuthFlowExecution -realmName $realmName -flowName $flowName -execution $authFormExecDetails -baseUrl $baseUrl -token $tokenCache.GetToken()

        Write-Log"Set flow as default for browser logins"
        $realm = [PSCustomObject]@{
            #browserFlow = "browser"
            browserFlow = $flowName
        }
        UpdateRealm -realmName $realmName -realm $realm -baseUrl $baseUrl -token $tokenCache.GetToken()
    }


    #
    # Attribute "registrationNumber"
    #

    # Create attribute
    $regNoAttribute = [PSCustomObject]@{
        name = "registrationNumber"
        displayName = ""
        validations = [PSCustomObject]@{}
        annotations = [PSCustomObject]@{
            inputType = "text"
        }
        permissions = [PSCustomObject]@{
            view = @(
                "user"
            )
            edit = @(
                "admin"
            )
        }
        multivalued = $false
    }
    $profile = GetUserProfile -realmName $realmName -baseUrl $baseUrl -token $tokenCache.GetToken()
    $existingRegNoAttribute = $profile.attributes | ? { $_.name -eq $regNoAttribute.name } | select -First 1
    if ($null -ne $existingRegNoAttribute) {
        Write-Log"Attribute ""$($regNoAttribute.name)"" already exists - skip creation"
    }
    else {
        $profile.attributes += $regNoAttribute
        Write-Log"Add attribute ""$($regNoAttribute.name)"""
        UpdateUserProfile -realmName $realmName -userProfile $profile -baseUrl $baseUrl -token $tokenCache.GetToken()
    }

    # Add mapper
    $clientScopes = ListClientScopes -realmName $realmName -baseUrl $baseUrl -token $tokenCache.GetToken()
    $profileScopeId = $clientScopes | ? { $_.name -eq "profile" } | select -ExpandProperty id -First 1

    $mapperModel = [PSCustomObject]@{
        protocol = "openid-connect"
        protocolMapper = "oidc-usermodel-attribute-mapper"
        name = "registrationNumber"
        config = [PSCustomObject]@{
            "claim.name" = "registrationNumber"
            "jsonType.label" = "String"
            "id.token.claim" = $true
            "access.token.claim" = $true
            "lightweight.claim" = $false
            "userinfo.token.claim" = $true
            "introspection.token.claim" = $true
            "user.attribute" = "registrationNumber"
        }
    }
    $existingMapperModels = ListMapperModels -scopeId $profileScopeId -realmName $realmName -baseUrl $baseUrl -token $tokenCache.GetToken()
    $existingMapperModel = $existingMapperModels | ? { $_.name -eq $mapperModel.name } | select -First 1
    if ($null -ne $existingMapperModel) {
        Write-Log"Mapper model ""$($mapperModel.name)"" already exists - skip creation"
    }
    else {
        Write-Log"Add mapper model ""$($mapperModel.name)"""
        CreateMapperModel -realmName $realmName -scopeId $profileScopeId -mapper $mapperModel -baseUrl $baseUrl -token $tokenCache.GetToken() | Out-Null
    }


    #
    # Theme
    #

    $serverInfo = GetServerInfo -baseUrl $baseUrl -token $tokenCache.GetToken()
    $theme = $serverInfo.themes.login | ? { $_.name -like "*kaelte*" } | select -ExpandProperty name -First 1
    if ($null -eq $theme) {
        Write-Warning "Theme does not exist (is the file in the mapped volume?) - skip"
    }
    else {
        $realm = GetRealm -realmName $realmName -baseUrl $baseUrl -token $tokenCache.GetToken()
        if ($realm.loginTheme -eq $theme) {
            Write-Log"Theme ""$($theme)"" is already set - skip"
        }
        else {
            Write-Log"Set theme ""$($theme)"""
            UpdateUiExt -realmName $realmName -theme $theme -baseUrl $baseUrl -token $tokenCache.GetToken()
        }
    }


    #
    # User client
    #

    # Create client
    $userClient = [PSCustomObject]@{
        id = $userClientId
        protocol = "openid-connect"
        clientId = "users"
        name = ""
        description = ""
        publicClient = $true
        authorizationServicesEnabled = $false
        serviceAccountsEnabled = $false
        implicitFlowEnabled = $false
        directAccessGrantsEnabled = $true
        standardFlowEnabled = $true
        frontchannelLogout = $true
        attributes = [PSCustomObject]@{
            saml_idp_initiated_sso_url_name = ""
            "oauth2.device.authorization.grant.enabled" = $false
            "oidc.ciba.grant.enabled" = $false
        }
        alwaysDisplayInConsole = $false
        rootUrl = $appUrl
        baseUrl = ""
        redirectUris = @(
            "$($appUrl)/*"
        )
        webOrigins = @(
            $appUrl
        )
    }

    $clients = ListClients -realmName $realmName -baseUrl $baseUrl -token $tokenCache.GetToken()
    $existingUserClient = $clients | ? { $_.clientId -eq $userClient.clientId }
    if ($null -ne $existingUserClient) {
        $userClientId = $existingUserClient.id
        Write-Log"Client ""$($userClient.clientId)"" already exists - skip creation"
    }
    else {
        Write-Log"Create client ""$($userClient.clientId)"""
        $userClientId = CreateClient -realmName $realmName -client $userClient -baseUrl $baseUrl -token $tokenCache.GetToken()
    }

    # Add user roles
    $adminRoleName = "ADMIN"
    $userRoles = @(
        [PSCustomObject]@{
            name = $adminRoleName
            description = ""
            attributes = [PSCustomObject]@{}
        },
        [PSCustomObject]@{
            name = "OPERATOR"
            description = ""
            attributes = [PSCustomObject]@{}
        }
    )
    $existingRoles = ListClientRoles -realmName $realmName -clientId $userClientId -baseUrl $baseUrl -token $tokenCache.GetToken()
    foreach ($userRole in $userRoles) {
        $existingRole = $existingRoles | ? { $_.name -eq $userRole.name } | select -First 1
        if ($null -ne $existingRole) {
            Write-Log"Role ""$($userRole.name)"" already exists - skip creation"
        }
        else {
            Write-Log"Create role ""$($userRole.name)"""
            CreateClientRole -realmName $realmName -clientId $userClientId -role $userRole -baseUrl $baseUrl -token $tokenCache.GetToken() | Out-Null
        }
    }

    # Add mapper for roles
    $clientScopes = ListClientScopes -realmName $realmName -baseUrl $baseUrl -token $tokenCache.GetToken()
    $rolesScope = $clientScopes | ? { $_.name -eq "roles" } | select -First 1
    $rolesScopeId = $rolesScope.id
    $clientRolesMapperId = $rolesScope.protocolMappers | ? { $_.name -eq "client roles" } | select -ExpandProperty id -First 1
    $clientScopeMapperModel = GetMapperModel -realmName $realmName -scopeId $rolesScopeId -modelId $clientRolesMapperId -baseUrl $baseUrl -token $tokenCache.GetToken()
    if ($clientScopeMapperModel.config.'access.token.claim' -eq "true" -and $clientScopeMapperModel.config.'id.token.claim' -eq "true" -and $clientScopeMapperModel.config.'lightweight.token.claim' -eq "true" -and $clientScopeMapperModel.config.'userinfo.token.claim' -eq "true") {
        Write-Log"Roles already added to all tokens and user info - skip"
    }
    else {
        Write-Log"Add roles to all tokens and user info"

        SetMemberSafe -obj $clientScopeMapperModel.config -memberName 'access.token.claim' -value "true"
        SetMemberSafe -obj $clientScopeMapperModel.config -memberName 'id.token.claim' -value "true"
        SetMemberSafe -obj $clientScopeMapperModel.config -memberName 'lightweight.token.claim' -value "true"
        SetMemberSafe -obj $clientScopeMapperModel.config -memberName 'userinfo.token.claim' -value "true"

        UpdateClientScopeMapperModel -realmName $realmName -scopeId $rolesScopeId -modelId $clientRolesMapperId -model $clientScopeMapperModel -baseUrl $baseUrl -token $tokenCache.GetToken()
    }


    #
    # Machine client
    #

    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($machineClientSecret)
    $decodedMachineClientSecret = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    $machineClient = [PSCustomObject]@{
        protocol = "openid-connect"
        clientId = "backend"
        name = ""
        description = ""
        publicClient = $false
        authorizationServicesEnabled = $false
        serviceAccountsEnabled = $true
        implicitFlowEnabled = $false
        directAccessGrantsEnabled = $false
        standardFlowEnabled = $false
        frontchannelLogout = $true
        attributes = [PSCustomObject]@{
            saml_idp_initiated_sso_url_name = ""
            "oauth2.device.authorization.grant.enabled" = $false
            "oidc.ciba.grant.enabled" = $false
        }
        alwaysDisplayInConsole = $false
        rootUrl = ""
        baseUrl = ""
        secret = $decodedMachineClientSecret
    }

    $clients = ListClients -realmName $realmName -baseUrl $baseUrl -token $tokenCache.GetToken()
    $existingMachineClient = $clients | ? { $_.clientId -eq $machineClient.clientId }
    if ($null -ne $existingMachineClient) {
        $machineClientId = $existingMachineClient.id
        Write-Log"Client ""$($machineClient.clientId)"" already exists - skip creation"
    }
    else {
        Write-Log"Create client ""$($machineClient.clientId)"""
        $machineClientId = CreateClient -realmName $realmName -client $machineClient -baseUrl $baseUrl -token $tokenCache.GetToken()
    }

    $machineClientRoles = @(
        "view-users",
        "query-users",
        "query-groups",
        "query-clients",
        "view-clients",
        "view-realm",
        "manage-users"
    )

    Write-Log"Assign service account roles to client ""$($machineClient.clientId)"""
    $machineClientServiceAccount = GetClientServiceAccountUser -realmName $realmName -clientId $machineClientId -baseUrl $baseUrl -token $tokenCache.GetToken()
    $realmManagement = ListClients -realmName $realmName -baseUrl $baseUrl -token $tokenCache.GetToken() | ? { $_.clientId -eq "realm-management" } | select -First 1
    $rolesToAdd = ListClientRoles -realmName $realmName -clientId $realmManagement.id -baseUrl $baseUrl -token $tokenCache.GetToken() | ? { $_.name -in $machineClientRoles }
    AddServiceAccountClientRoles -realmName $realmName -userId $machineClientServiceAccount.id -clientId $realmManagement.id -roles $rolesToAdd -baseUrl $baseUrl -token $tokenCache.GetToken()


    #
    # Create initial app admin
    #

    $initialAdminUser = [PSCustomObject]@{
        username = $appAdminUsername
        email = $appAdminUsername
        enabled = $true
        emailVerified = $true
        firstName = $appAdminFirstname
        lastName = $appAdminLastname
    }

    $existingUsers = ListUsers -realmName $realmName -baseUrl $baseUrl -token $tokenCache.GetToken()
    $existingInitialAdminUser = $existingUsers | ? { $_.username -eq $initialAdminUser.username } | select -First 1
    if ($null -ne $existingInitialAdminUser) {
        Write-Log"Initial admin user ""$($initialAdminUser.username)"" already exists - skip creation"
        $adminUserId = $existingInitialAdminUser.id
    }
    else {
        Write-Log"Create admin user ""$($initialAdminUser.username)"""
        $adminUserId = CreateUser -realmName $realmName -user $initialAdminUser -baseUrl $baseUrl -token $tokenCache.GetToken()

        Write-Log"Set password for admin user ""$($initialAdminUser.username)"""
        SetUserPassword -realmName $realmName -userId $adminUserId -password $appAdminPassword -baseUrl $baseUrl -token $tokenCache.GetToken()
    }

    $adminRole = ListClientRoles -realmName $realmName -clientId $userClientId -baseUrl $baseUrl -token $tokenCache.GetToken() | ? { $_.name -eq $adminRoleName }
    $existingUserRoles = ListUserClientRoleMappings -realmName $realmName -userId $adminUserId -clientId $userClientId -baseUrl $baseUrl -token $tokenCache.GetToken()
    $existingUserAdminRole = $existingUserRoles | ? { $_.id -eq $adminRole.id } | select -First 1
    if ($null -ne $existingUserAdminRole) {
        Write-Log"User ""$($initialAdminUser.username)"" is already application admin - skip assignment"
    }
    else {
        Write-Log"Make user ""$($initialAdminUser.username)"" application admin"
        AddUserClientRoles -realmName $realmName -userId $adminUserId -clientId $userClientId -roles $adminRole -baseUrl $baseUrl -token $tokenCache.GetToken()
    }

    Write-Log"Done" -ForegroundColor Green
}

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