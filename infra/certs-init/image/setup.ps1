param (
    [string]$password = $env:PASSWORD,
    [string]$exportCrtPath = $env:EXPORT_CRT_PATH,
    [string]$exportPfxPath = $env:EXPORT_PFX_PATH,
    [string]$caName = $env:CA_NAME
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

# Check if certificates already exist and create if not
if ((Test-Path $exportCrtPath) -and (Test-Path $exportPfxPath)) {
    Write-Log"Certificates already exist - skip generation"
    exit 0
}

try {
    PrepareKaeltehilfeCerts -caName $caName `
                            -exportPfxPath $exportPfxPath `
                            -pfxPassword ($password | ConvertTo-SecureString -AsPlainText -Force) `
                            -exportCrtPath $exportCrtPath

}
catch [Exception] {
    Write-Error $_.Exception.ToString()
    exit 1
}
