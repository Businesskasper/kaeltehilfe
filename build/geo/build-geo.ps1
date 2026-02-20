if ($psISE) {
    $global:root = $psISE.CurrentFile | Select-Object -ExpandProperty FullPath | Split-Path -Parent
}
elseif ($profile -match "VSCode") { 
    $global:root = $psEditor.GetEditorContext().CurrentFile.Path | Split-Path -Parent
}
else {
    $global:root = $MyInvocation.MyCommand.Definition | Split-Path -Parent 
}

Write-Host "Build geo container image" -ForegroundColor Cyan

. ([System.IO.Path]::Combine($global:root, "..", "functions.ps1"))

$dockerImageName = "kaeltehilfe-geo:latest"

$projectDir = Resolve-Path -Path ([System.IO.Path]::Combine($global:root, "..", "..", "kaeltehilfe-geo")) -ErrorAction Stop

$publishDir = [System.IO.Path]::Combine($global:root, "publish-geo")
if (Test-Path -Path $publishDir) {
    Write-Host "Clean up previous publish directory"
    Remove-Item -Recurse -Force $publishDir -ErrorAction SilentlyContinue | Out-Null
}

$dockerImageExportPath = [System.IO.Path]::Combine($global:root, "..", "result", "docker", "images", "kaeltehilfe-geo.tar")
if (Test-Path -Path $dockerImageExportPath) {
    Write-Host "Clean up previously exported image"
    Remove-Item -Force $dockerImageExportPath -ErrorAction SilentlyContinue | Out-Null
}

try {
    Write-Host "Copy project to $($publishDir)"
    New-Item -Path $publishDir -ItemType Directory | Out-Null
    $files = Get-ChildItem -Path $projectDir -Recurse | ? { $_.Name -like "*.go" -or $_.Name -like "*.mod" -or $_.Name -like "*.sum" }
    foreach ($file in $files) {
        $destination = $file.FullName.Replace($projectDir, $publishDir)
        $destinationDir = [System.IO.Path]::GetDirectoryName($destination)
        if (-not (Test-Path -Path $destinationDir)) {
            New-Item -Path $destinationDir -ItemType Directory | Out-Null
        }
        Copy-Item -Path $file.FullName -Destination $destination | Out-Null
    }

    Write-Host "Build image"
    buildDockerImage -dockerFileDir $global:root -dockerImageName $dockerImageName
    Write-Host "Image built as $($dockerImageName)"

    Write-Host "Export image"
    exportDockerImage -dockerImageName $dockerImageName -exportPath $dockerImageExportPath
}
catch [Exception] {
    Write-Host "Geo build failed" -ForegroundColor Red
    Write-Host $_.Exception.ToString()
}
