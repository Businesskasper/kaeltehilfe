if ($psISE) {
    $global:root = $psISE.CurrentFile | select -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") { 
    $global:root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $global:root = $MyInvocation.MyCommand.Definition | Split-Path -Parent 
}

Write-Host "Build frontend container image" -ForegroundColor Cyan

. ([System.IO.Path]::Combine($global:root, "..", "functions.ps1"))

$frontendDir = [System.IO.Path]::Combine($global:root, "..", "..", "kaeltebus-frontend")
$publishDir = [System.IO.Path]::Combine($global:root, "publish-frontend")

$dockerImageName = "kaeltebusui:latest"
if (Test-Path -Path $publishDir) {
    Write-Host "Clean up previous publish directory"
    Remove-Item -Recurse -Force $publishDir -ErrorAction SilentlyContinue | Out-Null
}
    
$dockerImageExportPath = [System.IO.Path]::Combine($global:root, "..", "images", "kaeltebusui.tar")
if (Test-Path -Path $dockerImageExportPath) {
    Write-Host "Clean up previous exported image"
    Remove-Item -Force $dockerImageExportPath -ErrorAction SilentlyContinue | Out-Null
}

# Publish
try {
    # Out dir is hard coded to build/publish-frontend in frontends vite config
    Write-Host "Publish" -ForegroundColor Blue

    invokeNpmScript -projectPath $frontendDir -scriptName "build"
    Write-Host "Artifacts are located in $($publishDir)" -ForegroundColor Cyan
}
catch [Exception] {
    Write-Host "Build failed" -ForegroundColor Red
    Write-Host $_.Exception.ToString()
    $PSCmdlet.ThrowTerminatingError($_.Exception)
}

# Build image
try {
    Write-Host "Build image"
    buildDockerImage -dockerFileDir $global:root -dockerImageName $dockerImageName
    Write-Host "Image built as $($dockerImageName)"
}
catch [Exception] {
    Write-Host "Image build failed" -ForegroundColor Red
    Write-Host $_.Exception.ToString()
}

# Export image
try {
    Write-Host "Export image"
    exportDockerImage -dockerImageName $dockerImageName -exportPath $dockerImageExportPath
}
catch [Exception] {
    Write-Host "Image export failed" -ForegroundColor Red
    Write-Host $_.Exception.ToString()
}