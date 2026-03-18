if ($psISE) {
    $global:root = $psISE.CurrentFile | Select-Object -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") { 
    $global:root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $global:root = $MyInvocation.MyCommand.Definition | Split-Path -Parent 
}


# 
# Load functions
#

. ([System.IO.Path]::Combine($global:root, "..", "..", "scripts", "functions.ps1")) 
. ([System.IO.Path]::Combine($global:root, "..", "..", "scripts", "keycloak.ps1")) 
. ([System.IO.Path]::Combine($global:root, "..", "..", "scripts", "certs.ps1")) 


# 
# Vars
#

$appAdminUsername = "luka.weis@cgi.com"
$appAdminFirstname = "Luka"
$appAdminLastname = "Weis"

$password = "Passw0rd" | ConvertTo-SecureString -AsPlainText -Force
$machineClientSecret = GeneratePassword -length 32 | ConvertTo-SecureString -AsPlainText -Force
$pfxPasswortEnvVar = "ROOT_CERT_PASSWORD"
$machineClientEnvVar = "KC_CLIENT_SECRET"


#
# Generate certificates and polulate env var
#

PrepareKaeltehilfeCerts -caName "ulm" `
                        -exportPfxPath ([System.IO.Path]::Combine($global:root, "..", "certs", "root-pfx", "rootCa.pfx")) `
                        -pfxPassword $password `
                        -pfxPasswortEnvVar "ROOT_CERT_PASSWORD" `
                        -exportCrtPath ([System.IO.Path]::Combine($global:root, "..", "certs", "root-crt", "rootCa.crt"))

#
# Setup Keycloak
#

SetupKaeltehilfeKeycloak -realmName "ulm" `
                         -requireSsl "NONE" `
                         -appUrl "http://localhost:5173" `
                         -adminUsername "admin" `
                         -adminPassword $password `
                         -baseUrl "http://localhost:8050" `
                         -appAdminUsername $appAdminUsername `
                         -appAdminFirstname $appAdminFirstname `
                         -appAdminLastname $appAdminLastname `
                         -appAdminPassword $password `
                         -machineClientSecret $machineClientSecret


#
# Populate env vars
#

# For pfx password
[System.Environment]::SetEnvironmentVariable($pfxPasswortEnvVar, (DecryptSecureString -secureString $password), [System.EnvironmentVariableTarget]::Machine)
Write-Host "Populated env var ""$($pfxPasswortEnvVar)"" - restart your shell for changes to take effect"

# For machine client
[System.Environment]::SetEnvironmentVariable($machineClientEnvVar, (DecryptSecureString -secureString $machineClientSecret), [System.EnvironmentVariableTarget]::Machine)
Write-Host "Populated env var ""$($machineClientEnvVar)"" - restart your shell for changes to take effect"

