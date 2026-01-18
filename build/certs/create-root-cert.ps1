param (
    [string]$caName = "kaeltehilfe",
    [SecureString]$pfxPassword = (ConvertTo-SecureString -AsPlainText -String "Passw0rd" -Force)
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

. ([System.IO.Path]::Combine($global:root, "..", "functions.ps1"))

$pfxPath = [System.IO.Path]::Combine($global:root, "..", "result", "kaeltehilfe-api", "cert", "root", "root.pfx")
Remove-Item -Path $pfxPath -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
$caPath = [System.IO.Path]::Combine($global:root, "..", "result", "keycloak", "x509", "rootCA.crt")
Remove-Item -Path $caPath -Recurse -Force -ErrorAction SilentlyContinue | Out-Null

CreateSignedCertificate -signer `
    -commonName $caName `
    -exportPfxPath $pfxPath `
    -exportPfxPassword $pfxPassword `
    -exportCaPath $caPath | Out-Null

