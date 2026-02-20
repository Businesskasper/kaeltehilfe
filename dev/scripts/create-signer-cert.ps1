param (
    [string]$caName = "kaeltehilfe",
    [string]$exportPfxPath = "C:\Git\kaeltehilfe\dev\certs\root\rootCert.pfx",
    [SecureString]$pfxPassword = (ConvertTo-SecureString -AsPlainText -String "Passw0rd" -Force),
    [string]$exportCaPath = "C:\Git\kaeltehilfe\dev\keycloak\x509\rootCA.crt"
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

CreateSignedCertificate -signer `
    -commonName $caName `
    -exportCaPath $exportCaPath `
    -exportPfxPath $exportPfxPath `
    -exportPfxPassword $pfxPassword