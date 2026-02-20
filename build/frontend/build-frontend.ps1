if ($psISE) {
    $global:root = $psISE.CurrentFile | Select-Object -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") { 
    $global:root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $global:root = $MyInvocation.MyCommand.Definition | Split-Path -Parent 
}

Write-Host "Build frontend container image" -ForegroundColor Cyan

. ([System.IO.Path]::Combine($global:root, "..", "functions.ps1"))

$frontendDir = [System.IO.Path]::Combine($global:root, "..", "..", "kaeltehilfe-frontend")
$publishDir = [System.IO.Path]::Combine($global:root, "publish-frontend")

$dockerImageName = "kaeltehilfe-ui:latest"
if (Test-Path -Path $publishDir) {
    Write-Host "Clean up previous publish directory"
    Remove-Item -Recurse -Force $publishDir -ErrorAction SilentlyContinue | Out-Null
}
    
$dockerImageExportPath = [System.IO.Path]::Combine($global:root, "..", "result", "docker", "images", "kaeltehilfe-ui.tar")
if (Test-Path -Path $dockerImageExportPath) {
    Write-Host "Clean up previously exported image"
    Remove-Item -Force $dockerImageExportPath -ErrorAction SilentlyContinue | Out-Null
}

# Publish
try {
    # Out dir is hard coded to build/publish-frontend in frontends vite config
    Write-Host "Build project to $($publishDir)"
    invokeNpmScript -projectPath $frontendDir -scriptName "build"

    Write-Host "Build image"
    buildDockerImage -dockerFileDir $global:root -dockerImageName $dockerImageName
    Write-Host "Image built as $($dockerImageName)"

    Write-Host "Export image"
    exportDockerImage -dockerImageName $dockerImageName -exportPath $dockerImageExportPath
}
catch [Exception] {
    Write-Host "Frontend build failed" -ForegroundColor Red
    Write-Host $_.Exception.ToString()
    break
}

