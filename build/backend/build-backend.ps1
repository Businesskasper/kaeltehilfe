if ($psISE) {
    $root = $psISE.CurrentFile | Select-Object -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") {
    $root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $root = $MyInvocation.MyCommand.Definition | Split-Path -Parent
}

. ([System.IO.Path]::Combine($root, "..", "functions.ps1"))

Write-Log "Build backend container image" -ForegroundColor Cyan

$dockerImageName = "kaeltehilfe-api:latest"
$dockerContext = [System.IO.Path]::Combine($root, "..", "..", "kaeltehilfe-backend")
$dockerFilePath = [System.IO.Path]::Combine($dockerContext, "dockerfile.prod")

$dockerImageExportPath = [System.IO.Path]::Combine($root, "..", "result", "docker", "images", "kaeltehilfe-api.tar")
if (Test-Path -Path $dockerImageExportPath) {
    Write-Log "Clean up previously exported image"
    Remove-Item -Force $dockerImageExportPath -ErrorAction SilentlyContinue | Out-Null
}

try {
    Write-Log "Build image"
    buildDockerImage -dockerFileDir $dockerContext -dockerImageName $dockerImageName -dockerFilePath $dockerFilePath
    Write-Log "Image built as $($dockerImageName)"

    Write-Log "Export image"
    exportDockerImage -dockerImageName $dockerImageName -exportPath $dockerImageExportPath
}
catch [Exception] {
    Write-Log "Backend build failed" -ForegroundColor Red
    Write-Log $_.Exception.ToString()
}
