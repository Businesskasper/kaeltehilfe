if ($psISE) {
    $root = $psISE.CurrentFile | Select-Object -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") {
    $root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $root = $MyInvocation.MyCommand.Definition | Split-Path -Parent
}

Write-Host "Build frontend container image" -ForegroundColor Cyan

. ([System.IO.Path]::Combine($root, "..", "functions.ps1"))

$dockerImageName = "kaeltehilfe-ui:latest"
$dockerContext = [System.IO.Path]::Combine($root, "..", "..", "kaeltehilfe-frontend")
$dockerFilePath = [System.IO.Path]::Combine($dockerContext, "dockerfile.prod")

$dockerImageExportPath = [System.IO.Path]::Combine($root, "..", "result", "docker", "images", "kaeltehilfe-ui.tar")
if (Test-Path -Path $dockerImageExportPath) {
    Write-Host "Clean up previously exported image"
    Remove-Item -Force $dockerImageExportPath -ErrorAction SilentlyContinue | Out-Null
}

try {
    Write-Host "Build image"
    buildDockerImage -dockerFileDir $dockerContext -dockerImageName $dockerImageName -dockerFilePath $dockerFilePath
    Write-Host "Image built as $($dockerImageName)"

    Write-Host "Export image"
    exportDockerImage -dockerImageName $dockerImageName -exportPath $dockerImageExportPath
}
catch [Exception] {
    Write-Host "Frontend build failed" -ForegroundColor Red
    Write-Host $_.Exception.ToString()
}
