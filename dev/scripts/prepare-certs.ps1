param (
    [string]$caName = "ulm",
    [string]$exportPfxPath = "..\certs\root-pfx\rootCert.pfx",
    [SecureString]$pfxPassword = (ConvertTo-SecureString -AsPlainText -String "Passw0rd" -Force),
    [string]$pfxPasswortEnvVar = "ROOT_CERT_PASSWORD",
    [string]$exportCrtPath = "..\certs\root-crt\rootCert.crt"
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

. ([System.IO.Path]::Combine($global:root, "..", "..", "build", "functions.ps1"))


# Prepare paths
$fullExportPfxPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($global:root, $exportPfxPath))
$fullExportCrtPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($global:root, $exportCrtPath))

New-Item -Path ($fullExportPfxPath | Split-Path -Parent) -ItemType Directory -ea 0 | Out-Null
New-Item -Path ($fullExportCrtPath | Split-Path -Parent) -ItemType Directory -ea 0 | Out-Null

# Create certificate files
$cert = CreateSignedCertificate -signer `
                                -commonName $caName `
                                -exportCaPath $fullExportCrtPath `
                                -exportPfxPath $fullExportPfxPath `
                                -exportPfxPassword $pfxPassword

Write-Host "Created and exported certificate ""$($cert.Thumbprint)"""

# Set pfx env var
[System.Environment]::SetEnvironmentVariable($pfxPasswortEnvVar, $pfxPassword, [System.EnvironmentVariableTarget]::Machine)

Write-Host "Populated env var ""$($pfxPasswortEnvVar)"" - restart your shell for changes to take effect"