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

Write-Log "Build certs-init container image" -ForegroundColor Cyan

$dockerImageName = "kaeltehilfe-certs-init:latest"
$dockerContext = [System.IO.Path]::Combine($root, "..", "infra", "certs-init", "image")

$dockerImageExportPath = [System.IO.Path]::Combine($root, "result", "docker", "images", "kaeltehilfe-certs-init.tar")
if (Test-Path -Path $dockerImageExportPath) {
    Write-Log "Clean up previously exported image"
    Remove-Item -Force $dockerImageExportPath -ErrorAction SilentlyContinue | Out-Null
}

try {
    Write-Log "Build image"
    buildDockerImage -dockerFileDir $dockerContext -dockerImageName $dockerImageName
    Write-Log "Image built as $($dockerImageName)"

    Write-Log "Export image"
    exportDockerImage -dockerImageName $dockerImageName -exportPath $dockerImageExportPath
}
catch [Exception] {
    Write-Log "certs-init build failed" -ForegroundColor Red
    Write-Log $_.Exception.ToString()
}
