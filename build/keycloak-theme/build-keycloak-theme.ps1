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
    & "C:\Program Files\Docker\Docker\resources\bin\docker" create --name $containerName $dockerImageName 2>&1 | Out-Null
    & "C:\Program Files\Docker\Docker\resources\bin\docker" cp "${containerName}:/keycloak-theme.jar" $jarPath
    & "C:\Program Files\Docker\Docker\resources\bin\docker" rm $containerName 2>&1 | Out-Null

    if (-not (Test-Path $jarPath)) {
        throw [Exception]::new("Failed to extract theme jar")
    }

    Write-Host "Theme is located in $(Resolve-Path -Path $publishDir)" -ForegroundColor Cyan
}
catch [Exception] {
    Write-Host "Build failed" -ForegroundColor Red
    Write-Host $_.Exception.ToString()
    # Clean up container on failure
    & "C:\Program Files\Docker\Docker\resources\bin\docker" rm $containerName 2>&1 | Out-Null
}
