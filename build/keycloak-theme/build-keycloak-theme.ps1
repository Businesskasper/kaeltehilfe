if ($psISE) {
    $root = $psISE.CurrentFile | Select-Object -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") {
    $root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $root = $MyInvocation.MyCommand.Definition | Split-Path -Parent
}

Write-Host "Build keycloak theme" -ForegroundColor Cyan

. ([System.IO.Path]::Combine($root, "..", "functions.ps1"))

$dockerImageName = "kaeltehilfe-keycloak-theme-build:latest"
$dockerContext = [System.IO.Path]::Combine($root, "..", "..", "kaeltehilfe-keycloak-theme")
$dockerFilePath = [System.IO.Path]::Combine($dockerContext, "dockerfile.build")

$publishDir = [System.IO.Path]::Combine($root, "..", "result", "keycloak", "themes")
New-Item -Path $publishDir -ItemType Directory -ErrorAction SilentlyContinue | Out-Null
Get-ChildItem -Path $publishDir | Where-Object { $_.Name -like "*.jar" } | Remove-Item -Force | Out-Null

try {
    Write-Host "Build theme in Docker"
    buildDockerImage -dockerFileDir $dockerContext -dockerImageName $dockerImageName -dockerFilePath $dockerFilePath
    Write-Host "Image built as $($dockerImageName)"

    Write-Host "Extract theme jar"
    $containerName = "kaeltehilfe-keycloak-theme-extract"
    $jarPath = [System.IO.Path]::Combine($publishDir, "kaeltehilfe-keycloak-theme.jar")

    # Create a temporary container and copy the jar out
    createDockerContainer -containerName $containerName -imageName $dockerImageName
    copyDockerFile -source "${containerName}:/keycloak-theme.jar" -destination $jarPath
    removeDockerContainer -containerName $containerName

    if (-not (Test-Path $jarPath)) {
        throw [Exception]::new("Failed to extract theme jar")
    }

    Write-Host "Theme is located in $(Resolve-Path -Path $publishDir)" -ForegroundColor Cyan
}
catch [Exception] {
    Write-Host "Build failed" -ForegroundColor Red
    Write-Host $_.Exception.ToString()
    # Clean up container on failure
    removeDockerContainer -containerName $containerName
}
