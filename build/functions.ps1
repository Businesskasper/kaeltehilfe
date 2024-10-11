function invokeNpmScript([string]$projectPath, [string]$scriptName) {
    $result = Start-Process -FilePath "C:\Program Files\nodejs\npm" -ArgumentList @("run", $scriptName) -Wait -PassThru -WorkingDirectory $projectPath
    if ($result.ExitCode -ne 0) {
        throw [Exception]::new("NPM script failed with exit code $($result.ExitCode)")
    }
}

function invokeDotnetCommand([string]$projectPath, [string]$command) {
    $result = Start-Process -FilePath "C:\Program Files\dotnet\dotnet.exe" -ArgumentList @($command) -Wait -PassThru -WorkingDirectory $projectPath
    if ($result.ExitCode -ne 0) {
        throw [Exception]::new("Dotnet command failed with exit code $($result.ExitCode)")
    }
}

function buildDockerImage([string]$dockerFileDir, [string]$dockerImageName) {
    $result = Start-Process -FilePath "C:\Program Files\Docker\Docker\resources\bin\docker" -ArgumentList @("build", ".", "-t", $dockerImageName) -Wait -PassThru -WorkingDirectory $dockerFileDir
    if ($result.ExitCode -ne 0) {
        throw [Exception]::new("Docker build failed with exit code $($result.ExitCode)")
    }
}

function exportDockerImage([string]$dockerImageName, [string]$exportPath) {
    $result = Start-Process -FilePath "C:\Program Files\Docker\Docker\resources\bin\docker" -ArgumentList @("save", $dockerImageName, "--output", $exportPath) -Wait -PassThru
    if ($result.ExitCode -ne 0) {
        throw [Exception]::new("Docker export failed with exit code $($result.ExitCode)")
    }
}