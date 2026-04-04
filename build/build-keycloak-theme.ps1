if ($psISE) {
    $root = $psISE.CurrentFile | Select-Object -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") {
    $root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $root = $MyInvocation.MyCommand.Definition | Split-Path -Parent
}

. ([System.IO.Path]::Combine($root, "functions.ps1"))

Write-Log "Build keycloak theme" -ForegroundColor Cyan

$dockerImageName = "kaeltehilfe-keycloak-theme-build:latest"
$dockerContext = [System.IO.Path]::Combine($root, "..", "kaeltehilfe-keycloak-theme")
$dockerFilePath = [System.IO.Path]::Combine($dockerContext, "dockerfile.build")

$publishDir = [System.IO.Path]::Combine($root, "result", "keycloak", "themes")
New-Item -Path $publishDir -ItemType Directory -ErrorAction SilentlyContinue | Out-Null
Get-ChildItem -Path $publishDir | ? { $_.Name -like "*.jar" } | % { Remove-Item -Force $_.FullName | Out-Null }

try {
    Write-Log "Build theme in Docker"
    buildDockerImage -dockerFileDir $dockerContext -dockerImageName $dockerImageName -dockerFilePath $dockerFilePath
    Write-Log "Image built as $($dockerImageName)"

    Write-Log "Extract theme jar"
    $containerName = "kaeltehilfe-keycloak-theme-extract"
    $jarPath = [System.IO.Path]::Combine($publishDir, "kaeltehilfe-keycloak-theme.jar")

    # Create a temporary container and copy the jar out
    createDockerContainer -containerName $containerName -imageName $dockerImageName
    copyDockerFile -source "${containerName}:/keycloak-theme.jar" -destination $jarPath
    removeDockerContainer -containerName $containerName

    if (-not (Test-Path $jarPath)) {
        throw [Exception]::new("Failed to extract theme jar")
    }

    Write-Log "Theme is located in $(Resolve-Path -Path $publishDir)" -ForegroundColor Cyan
}
catch [Exception] {
    Write-Log "Build failed" -ForegroundColor Red
    Write-Log $_.Exception.ToString()
    # Clean up container on failure
    removeDockerContainer -containerName $containerName
}
