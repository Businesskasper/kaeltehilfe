param (
    [string]$realmName = $ENV:REALM_NAME,
    [string]$realmRequireSsl = $ENV:REALM_REQUIRE_SSL,
    [string]$kcBaseUrl = $env:KC_BASE_URL,
    [string]$kcAdminUsername = $env:KC_ADMIN_USERNAME,
    [string]$kcAdminPassword = $env:KC_ADMIN_PASSWORD,
    [string]$appUrl = $ENV:APP_URL,
    [string]$appAdminUsername = $env:APP_ADMIN_USERNAME,
    [string]$appAdminFirstname = $ENV:APP_ADMIN_FIRSTNAME,
    [string]$appAdminLastname = $ENV:APP_ADMIN_LASTNAME,
    [string]$appAdminPassword = $env:APP_ADMIN_PASSWORD,
    [string]$machineClientSecret = $env:MACHINE_CLIENT_SECRET,
    [string]$userClientId = $env:USER_CLIENT_ID
)

$params = $MyInvocation.MyCommand.Parameters.Keys
foreach ($p in $params) {
    $value = Get-Variable -Name $p -ValueOnly -ErrorAction SilentlyContinue
    if ([String]::IsNullOrWhitespace($value)) {
        Write-Error "Parameter ""$($p)"" is not defined"
        exit 1
    }
}

# Load functions
if ($psISE) {
    $root = $psISE.CurrentFile | select -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") { 
    $root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $root = $MyInvocation.MyCommand.Definition | Split-Path -Parent 
}

. ([System.IO.Path]::Combine($root, "functions.ps1")) 

try {
    # Setup Keycloak
    SetupKaeltehilfeKeycloak -realmName $realmName `
                            -requireSsl $realmRequireSsl `
                            -baseUrl $kcBaseUrl `
                            -adminUsername $kcAdminUsername `
                            -adminPassword ($kcAdminPassword | ConvertTo-SecureString -AsPlainText -Force) `
                            -appUrl $appUrl `
                            -appAdminUsername $appAdminUsername `
                            -appAdminFirstname $appAdminFirstname `
                            -appAdminLastname $appAdminLastname `
                            -appAdminPassword ($appAdminPassword | ConvertTo-SecureString -AsPlainText -Force) `
                            -machineClientSecret ($machineClientSecret | ConvertTo-SecureString -AsPlainText -Force) `
                            -userClientId $userClientId
}
catch [Exception] {
    Write-Error $_.Exception.ToString()
    exit 1
}
