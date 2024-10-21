if ($psISE) {
    $global:root = $psISE.CurrentFile | Select-Object -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") { 
    $global:root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $global:root = $MyInvocation.MyCommand.Definition | Split-Path -Parent 
}

Write-Host "Build keycloak theme" -ForegroundColor Cyan

. ([System.IO.Path]::Combine($global:root, "..", "functions.ps1"))

$themeDir = [System.IO.Path]::Combine($global:root, "..", "..", "kaeltebus-keycloak-theme")
$distDir = [System.IO.Path]::Combine($themeDir, "dist_keycloak")
$publishDir = [System.IO.Path]::Combine($global:root, "..", "result", "keycloak", "themes")
$packageJsonPath = [System.IO.Path]::Combine($themeDir, "package.json")
$themeName = Get-Content -Path $packageJsonPath | ConvertFrom-Json | Select-Object -ExpandProperty name

Remove-Item -Path "$($distDir)/*" -Recurse -Force | Out-Null
Get-ChildItem -Path $publishDir | Where-Object { $_.Name -like "*.jar" } | Remove-Item -Force | Out-Null
New-Item -Path $publishDir -ItemType Directory -ErrorAction SilentlyContinue | Out-Null

try {
    Write-Host "Build project" -ForegroundColor Blue
    invokeNpmScript -projectPath $themeDir -scriptName "build-keycloak-theme"

    Write-Host "Copy results to $($publishDir)" -ForegroundColor Blue
    Copy-Item -Path "$($distDir)/keycloak-theme-for-kc-22-to-25.jar" -Destination $publishDir -Force
    Rename-Item -Path "$($publishDir)/keycloak-theme-for-kc-22-to-25.jar" -NewName "$($themeName).jar" -Force
    Write-Host "Theme is located in $($publishDir)" -ForegroundColor Cyan
}
catch [Exception] {
    Write-Host "Build failed" -ForegroundColor Red
    Write-Host $_.Exception.ToString()
    break
}
