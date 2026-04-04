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

Write-Log "Build geo container image" -ForegroundColor Cyan

$dockerImageName = "kaeltehilfe-geo:latest"
$dockerContext = [System.IO.Path]::Combine($root, "..", "kaeltehilfe-geo")
$dockerFilePath = [System.IO.Path]::Combine($dockerContext, "dockerfile.prod")

$dockerImageExportPath = [System.IO.Path]::Combine($root, "result", "docker", "images", "kaeltehilfe-geo.tar")
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
    Write-Log "Geo build failed" -ForegroundColor Red
    Write-Log $_.Exception.ToString()
}
