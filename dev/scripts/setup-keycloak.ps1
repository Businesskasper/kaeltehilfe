# Script to set up Keycloak realm and configurations for Kaeltehilfe
param (
    [string]$realmName = "ulm",
    # Should be NONE for development on localhost, ALL for deployments
    [string]$requireSsl = "NONE", # NONE, ALL, EXTERNAL
    # Url of the application
    [string]$appUrl = "http://localhost:5173",
    # Defaults for using cli on default realm and admin-cli client
    [string]$adminUsername = "admin",
    [SecureString]$adminPassword = (ConvertTo-SecureString -AsPlainText -String "Passw0rd" -Force),
    [string]$baseUrl = "http://localhost:8050",
    # Kaeltehilfe instance initial admin user
    [string]$appAdminUsername = "luka.weis@gmail.com",
    [string]$appAdminFirstname = "Luka",
    [string]$appAdminLastname = "Weis",
    [SecureString]$appAdminPassword = (ConvertTo-SecureString -AsPlainText -String "Passw0rd" -Force)
)

if ($psISE) {
    $global:root = $psISE.CurrentFile | Select-Object -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") { 
    $global:root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $global:root = $MyInvocation.MyCommand.Definition | Split-Path -Parent 
}

. ([System.IO.Path]::Combine($global:root, "..", "..", "build", "keycloak.ps1"))

# Token cache for script scope
$tokenData = [PSCustomObject]@{
    access_token = ""
    expiresAt = $null
}
function GetCachedToken() {
    $adminClient = "admin-cli"
    $adminRealm = "master"

    $now = [DateTime]::Now
    if ($null -eq $tokenData -or $null -eq $tokenData.expiresAt -or $tokenData.expiresAt -le $now) {
        $token = GetToken -username $adminUsername -password $adminPassword -realmName $adminRealm -clientId $adminClient -baseUrl $baseUrl
        $tokenData.access_token = $token.access_token
        $tokenData.expiresAt = $now.AddSeconds($token.expires_in)
    }
    return $tokenData.access_token
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

# 
# Create realm (with ssl requirements as defined)
#

$realms = ListRealms -baseUrl $baseUrl -token (GetCachedToken)
$existingRealm = $realms | ? { $_.realm -eq $realmName } | select -First 1
if ($null -ne $existingRealm) {
    Write-Host "Realm $($realm) already exists - skip creation"
}
else {
    Write-Host "Create realm ""$($realmName)"""
    $realm = [PSCustomObject]@{
        realm = $realmName
        enabled = $true
        sslRequired = $requireSsl
    }
    CreateRealm -realm $realm -baseUrl $baseUrl -token (GetCachedToken) | Out-Null
}


#
# Create browser auth flow
#

$flowName = "x509"

# Check if flow already exists to cancel execution
$authFlows = ListAuthFlows -realmName $realmName -baseUrl $baseUrl -token (GetCachedToken)
$existingAuthFlow = $authFlows | ? { $_.alias -eq $flowName } | select -First 1 # Should not be possible since we just created the realm - just to be sure and for future flexibility
if ($null -ne $existingAuthFlow) {
    Write-Host "Auth flow $($flowName) already exists - skip creation"
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
    Write-Host "Create auth flow ""$($flowName)"""
    $authFlowId = CreateAuthFlow -realmName $realmName -flow $flow -baseUrl $baseUrl -token (GetCachedToken)

    # Add executions
    Write-Host "Add and configure execution ""auth-cookie"""
    $authCookieExec = [PSCustomObject]@{
        provider = "auth-cookie"
    }
    $authCookieExecId = CreateAuthFlowExecution -realmName $realmName -flowName $flowName -execution $authCookieExec -baseUrl $baseUrl -token (GetCachedToken)
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
    UpdateAuthFlowExecution -realmName $realmName -flowName $flowName -execution $authCookieExecDetails -baseUrl $baseUrl -token (GetCachedToken)

    Write-Host "Add and configure execution ""auth-x509-client-username-form"""
    $x509CertExec = [PSCustomObject]@{
        provider = "auth-x509-client-username-form"
    }
    $x509CertExecId = CreateAuthFlowExecution -realmName $realmName -flowName $flowName -execution $x509CertExec -baseUrl $baseUrl -token (GetCachedToken)
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
    UpdateAuthFlowExecution -realmName $realmName -flowName $flowName -execution $x509CertExecDetails -baseUrl $baseUrl -token (GetCachedToken)
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
            "x509-cert-auth.crl-relative-path" = "/crl/crl.pem"
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
    UpdateAuthFlowExecutionConfig -realmName $realmName -executionId $x509CertExecId -config $x509CertExecConfig -baseUrl $baseUrl -token (GetCachedToken)

    Write-Host "Add execution subflow ""x509 forms"""
    $x509FormExec = [PSCustomObject]@{
      alias = "x509 forms"
      type = "basic-flow"
      provider = "basic-flow"
    }
    $x509FormExecFlowId = CreateAuthSubFlow -realmName $realmName -parentFlow $flowName -subFlow $x509FormExec -baseUrl $baseUrl -token (GetCachedToken)
    $allExecs = ListAuthFlowExecutions -realmName $realmName -flowName $flowName -baseUrl $baseUrl -token (GetCachedToken)
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
    UpdateAuthFlowExecution -realmName $realmName -flowName $flowName -execution $x509FormExecDetails -baseUrl $baseUrl -token (GetCachedToken)

    Write-Host "Add execution ""auth-username-password-form"" to subflow ""x509 forms"""
    $authFormExec = [PSCustomObject]@{
        provider = "auth-username-password-form"
    }
    $authFormExecId = CreateAuthFlowExecution -realmName $realmName -flowName $x509Exec.displayName -execution $authFormExec -baseUrl $baseUrl -token (GetCachedToken) # Sicher mit displayName?
    $authFormExecDetails = [PSCustomObject]@{
        id = $authFormExecId
        flowId = $x509ExecFlowId
        requirement = "REQUIRED"
    }
    UpdateAuthFlowExecution -realmName $realmName -flowName $flowName -execution $authFormExecDetails -baseUrl $baseUrl -token (GetCachedToken)

    Write-Host "Set flow as default for browser logins (refresh your realm if you see flow.undefined in the console)"
    $realm = [PSCustomObject]@{
        #browserFlow = "browser"
        browserFlow = $flowName
    }
    UpdateRealm -realmName $realmName -realm $realm -baseUrl $baseUrl -token (GetCachedToken)
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
$profile = GetUserProfile -realmName $realmName -baseUrl $baseUrl -token (GetCachedToken)
$existingRegNoAttribute = $profile.attributes | ? { $_.name -eq $regNoAttribute.name } | select -First 1
if ($null -ne $existingRegNoAttribute) {
    Write-Host "Attribute ""$($regNoAttribute.name)"" already exists - skip creation"
}
else {
    $profile.attributes += $regNoAttribute
    Write-Host "Add attribute ""$($regNoAttribute.name)"""
    UpdateUserProfile -realmName $realmName -userProfile $profile -baseUrl $baseUrl -token (GetCachedToken)
}

# Add mapper
$clientScopes = ListClientScopes -realmName $realmName -baseUrl $baseUrl -token (GetCachedToken)
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
$existingMapperModels = ListMapperModels -scopeId $profileScopeId -realmName $realmName -baseUrl $baseUrl -token (GetCachedToken)
$existingMapperModel = $existingMapperModels | ? { $_.name -eq $mapperModel.name } | select -First 1
if ($null -ne $existingMapperModel) {
    Write-Host "Mapper model ""$($regNoAttribute.name)"" already exists - skip creation"
}
else {
    Write-Host "Add mapper model ""$($mapperModel.name)"""
    CreateMapperModel -realmName $realmName -scopeId $profileScopeId -mapper $mapperModel -baseUrl $baseUrl -token (GetCachedToken) | Out-Null
}


#
# Theme
#

$serverInfo = GetServerInfo -baseUrl $baseUrl -token (GetCachedToken)
$theme = $serverInfo.themes.login | ? { $_.name -like "*kaelte*" } | select -ExpandProperty name -First 1
if ($null -eq $theme) {
    Write-Error "Theme does not exist (is the file in the mapped volume?) - skip"
}
else {
    $realm = GetRealm -realmName $realmName -baseUrl $baseUrl -token (GetCachedToken)
    if ($realm.loginTheme -eq $theme) {
        Write-Host "Theme ""$($theme)"" is already set - skip"
    }
    else {
        Write-Host "Set theme ""$($theme)"""
        UpdateUiExt -realmName $realmName -theme $theme -baseUrl $baseUrl -token (GetCachedToken)
    }
}

#
# User client
#

# Create client
$userClient = [PSCustomObject]@{
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

$clients = ListClients -realmName $realmName -baseUrl $baseUrl -token (GetCachedToken)
$existingUserClient = $clients | ? { $_.clientId -eq $userClient.clientId }
if ($null -ne $existingUserClient) {
    $userClientId = $existingUserClient.id
    Write-Host "Client ""$($userClient.clientId)"" already exists - skip creation"
}
else {
    Write-Host "Create client ""$($userClient.clientId)"""
    $userClientId = CreateClient -realmName $realmName -client $userClient -baseUrl $baseUrl -token (GetCachedToken)
}

# Add user roles
$adminRoleName = "Admin"
$userRoles = @(
    [PSCustomObject]@{
        name = $adminRoleName
        description = ""
        attributes = [PSCustomObject]@{}
    },
    [PSCustomObject]@{
        name = "Operator"
        description = ""
        attributes = [PSCustomObject]@{}
    }
)
$existingRoles = ListClientRoles -realmName $realmName -clientId $userClientId -baseUrl $baseUrl -token (GetCachedToken)
foreach ($userRole in $userRoles) {
    $existingRole = $existingRoles | ? { $_.name -eq $userRole.name } | select -First 1
    if ($null -ne $existingRole) {
        Write-Host "Role ""$($userRole.name)"" already exists - skip creation"
    }
    else {
        Write-Host "Create role ""$($userRole.name)"""
        CreateClientRole -realmName $realmName -clientId $userClientId -role $userRole -baseUrl $baseUrl -token (GetCachedToken) | Out-Null
    }
}

# Add mapper for roles
$clientScopes = ListClientScopes -realmName $realmName -baseUrl $baseUrl -token (GetCachedToken)
$rolesScope = $clientScopes | ? { $_.name -eq "roles" } | select -First 1
$rolesScopeId = $rolesScope.id
$clientRolesMapperId = $rolesScope.protocolMappers | ? { $_.name -eq "client roles" } | select -ExpandProperty id -First 1
$clientScopeMapperModel = GetMapperModel -realmName $realmName -scopeId $rolesScopeId -modelId $clientRolesMapperId -baseUrl $baseUrl -token (GetCachedToken)
if ($clientScopeMapperModel.config.'access.token.claim' -eq "true" -and $clientScopeMapperModel.config.'id.token.claim' -eq "true" -and $clientScopeMapperModel.config.'lightweight.token.claim' -eq "true" -and $clientScopeMapperModel.config.'userinfo.token.claim' -eq "true") {
    Write-Host "Roles are added to all tokens and user info"
}
else {
    Write-Host "Add roles to all tokens"

    SetMemberSafe -obj $clientScopeMapperModel.config -memberName 'access.token.claim' -value "true"
    SetMemberSafe -obj $clientScopeMapperModel.config -memberName 'id.token.claim' -value "true"
    SetMemberSafe -obj $clientScopeMapperModel.config -memberName 'lightweight.token.claim' -value "true"
    SetMemberSafe -obj $clientScopeMapperModel.config -memberName 'userinfo.token.claim' -value "true"

    UpdateClientScopeMapperModel -realmName $realmName -scopeId $rolesScopeId -modelId $clientRolesMapperId -model $clientScopeMapperModel -baseUrl $baseUrl -token (GetCachedToken)
}

#
# Machine client
#

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
}

$clients = ListClients -realmName $realmName -baseUrl $baseUrl -token (GetCachedToken)
$existingMachineClient = $clients | ? { $_.clientId -eq $machineClient.clientId }
if ($null -ne $existingMachineClient) {
    $machineClientId = $existingMachineClient.id
    Write-Host "Client ""$($machineClient.clientId)"" already exists - skip creation"
}
else {
    Write-Host "Create client ""$($machineClient.clientId)"""
    $machineClientId = CreateClient -realmName $realmName -client $machineClient -baseUrl $baseUrl -token (GetCachedToken)
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

$machineClientServiceAccount = GetClientServiceAccountUser -realmName $realmName -clientId $machineClientId -baseUrl $baseUrl -token (GetCachedToken)
$realmManagement = ListClients -realmName $realmName -baseUrl $baseUrl -token (GetCachedToken) | ? { $_.clientId -eq "realm-management" } | select -First 1
$rolesToAdd = ListClientRoles -realmName $realmName -clientId $realmManagement.id -baseUrl $baseUrl -token (GetCachedToken) | ? { $_.name -in $machineClientRoles }
AddServiceAccountClientRoles -realmName $realmName -userId $machineClientServiceAccount.id -clientId $realmManagement.id -roles $rolesToAdd -baseUrl $baseUrl -token (GetCachedToken)

#
# Create initial app admin
#

$initialAdminUser = [PSCustomObject]@{
    username = $appAdminUsername
    enabled = $true
    emailVerified = $true
    firstName = $appAdminFirstname
    lastName = $appAdminLastname
}

$existingUsers = ListUsers -realmName $realmName -baseUrl $baseUrl -token (GetCachedToken)
$existingInitialAdminUser = $existingUsers | ? { $_.username -eq $initialAdminUser.username } | select -First 1
if ($null -ne $existingInitialAdminUser) {
    Write-Host "Initial admin user ""$($initialAdminUser.username)"" already exists - skip creation"
    $adminUserId = $existingInitialAdminUser.id
}
else {
    Write-Host "Create admin user"
    $adminUserId = CreateUser -realmName $realmName -user $initialAdminUser -baseUrl $baseUrl -token (GetCachedToken)

    Write-Host "Set admin password"
    SetUserPassword -realmName $realmName -userId $adminUserId -password $appAdminPassword -baseUrl $baseUrl -token (GetCachedToken)
}

$adminRole = ListClientRoles -realmName $realmName -clientId $userClientId -baseUrl $baseUrl -token (GetCachedToken) | ? { $_.name -eq $adminRoleName }
$existingUserRoles = ListUserClientRoleMappings -realmName $realmName -userId $adminUserId -clientId $userClientId -baseUrl $baseUrl -token (GetCachedToken)
$existingUserAdminRole = $existingUserRoles | ? { $_.id -eq $adminRole.id } | select -First 1
if ($null -ne $existingUserAdminRole) {
    Write-Host "User ""$($initialAdminUser.username)"" is already application admin - skip assign"
}
else {
    Write-Host "Make user ""$($initialAdminUser.username)"" application admin"
    AddUserClientRoles -realmName $realmName -userId $adminUserId -clientId $userClientId -roles $adminRole -baseUrl $baseUrl -token (GetCachedToken)
}
