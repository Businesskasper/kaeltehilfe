if ($psISE) {
    $global:root = $psISE.CurrentFile | Select-Object -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") { 
    $global:root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $global:root = $MyInvocation.MyCommand.Definition | Split-Path -Parent 
}

Write-Host "Build backend container image" -ForegroundColor Cyan

. ([System.IO.Path]::Combine($global:root, "..", "functions.ps1"))

$backendDir = [System.IO.Path]::Combine($global:root, "..", "..", "kaeltehilfe-backend", "src")
$publishDir = [System.IO.Path]::Combine($global:root, "publish-backend")

$dockerImageName = "kaeltehilfe-api:latest"
if (Test-Path -Path $publishDir) {
    Write-Host "Clean up previous publish directory"
    Remove-Item -Recurse -Force $publishDir -ErrorAction SilentlyContinue | Out-Null
}
    
$dockerImageExportPath = [System.IO.Path]::Combine($global:root, "..", "result", "docker", "images", "kaeltehilfe-api.tar")
if (Test-Path -Path $dockerImageExportPath) {
    Write-Host "Clean up previous exported image"
    Remove-Item -Force $dockerImageExportPath -ErrorAction SilentlyContinue | Out-Null
}

try {
    Write-Host "Build project to $($publishDir)"
    invokeDotnetCommand -projectPath $backendDir -command "publish -c Release -o $($publishDir)"

    Write-Host "Build image"
    buildDockerImage -dockerFileDir $global:root -dockerImageName $dockerImageName
    Write-Host "Image built as $($dockerImageName)"

    Write-Host "Export image"
    exportDockerImage -dockerImageName $dockerImageName -exportPath $dockerImageExportPath
}
catch [Exception] {
    Write-Host "Backend build failed" -ForegroundColor Red
    Write-Host $_.Exception.ToString()
}
