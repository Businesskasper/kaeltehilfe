if ($psISE) {
    $global:root = $psISE.CurrentFile | Select-Object -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") { 
    $global:root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $global:root = $MyInvocation.MyCommand.Definition | Split-Path -Parent 
}

Write-Host "Build pgosm-init container image" -ForegroundColor Cyan

. ([System.IO.Path]::Combine($global:root, "..", "functions.ps1"))

$dockerImageName = "pgosm-init:latest"

$dockerImageExportPath = [System.IO.Path]::Combine($global:root, "..", "result", "docker", "images", "pgosm-init.tar")
if (Test-Path -Path $dockerImageExportPath) {
    Write-Host "Clean up previously exported image"
    Remove-Item -Force $dockerImageExportPath -ErrorAction SilentlyContinue | Out-Null
}

try {
    Write-Host "Build image"
    buildDockerImage -dockerFileDir $global:root -dockerImageName $dockerImageName
    Write-Host "Image built as $($dockerImageName)"

    Write-Host "Export image"
    exportDockerImage -dockerImageName $dockerImageName -exportPath $dockerImageExportPath
}
catch [Exception] {
    Write-Host "pgosm-init build failed" -ForegroundColor Red
    Write-Host $_.Exception.ToString()
}
