if ($psISE) {
    $root = $psISE.CurrentFile | Select-Object -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") {
    $root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $root = $MyInvocation.MyCommand.Definition | Split-Path -Parent
}

Write-Host "Build keycloak container image" -ForegroundColor Cyan

. ([System.IO.Path]::Combine($root, "..", "functions.ps1"))

$dockerImageName = "kaeltehilfe-keycloak:latest"

$dockerImageExportPath = [System.IO.Path]::Combine($root, "..", "result", "docker", "images", "kaeltehilfe-keycloak.tar")
if (Test-Path -Path $dockerImageExportPath) {
    Write-Host "Clean up previously exported image"
    Remove-Item -Force $dockerImageExportPath -ErrorAction SilentlyContinue | Out-Null
}

try {
    Write-Host "Build image"
    buildDockerImage -dockerFileDir ([System.IO.Path]::Combine($root, "..", "..", "keycloak", "image")) -dockerImageName $dockerImageName
    Write-Host "Image built as $($dockerImageName)"

    Write-Host "Export image"
    exportDockerImage -dockerImageName $dockerImageName -exportPath $dockerImageExportPath
}
catch [Exception] {
    Write-Host "Keycloak build failed" -ForegroundColor Red
    Write-Host $_.Exception.ToString()
}
