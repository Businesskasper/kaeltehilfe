
function Write-Log([string]$message, [System.ConsoleColor]$foregroundColor = [System.ConsoleColor]::White) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $message" -ForegroundColor $foregroundColor
}

function buildDockerImage([string]$dockerFileDir, [string]$dockerImageName, [string[]]$buildArgs, [string]$dockerFilePath) {
    $argumentList = @("build", ".", "-t", $dockerImageName)
    if (-not [string]::IsNullOrEmpty($dockerFilePath)) {
        $argumentList += @("-f", $dockerFilePath)
    }
    if ($null -ne $buildArgs) {
        foreach ($buildArg in $buildArgs) {
            $argumentList += "--build-arg $($buildArg)"
        }
    }
    $result = Start-Process -FilePath "C:\Program Files\Docker\Docker\resources\bin\docker" -ArgumentList $argumentList -Wait -PassThru -WorkingDirectory $dockerFileDir
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

function createDockerContainer([string]$containerName, [string]$imageName) {
    $result = Start-Process -FilePath "C:\Program Files\Docker\Docker\resources\bin\docker" -ArgumentList @("create", "--name", $containerName, $imageName) -Wait -PassThru
    if ($result.ExitCode -ne 0) {
        throw [Exception]::new("Docker create failed with exit code $($result.ExitCode)")
    }
}

function copyDockerFile([string]$source, [string]$destination) {
    $result = Start-Process -FilePath "C:\Program Files\Docker\Docker\resources\bin\docker" -ArgumentList @("cp", $source, $destination) -Wait -PassThru
    if ($result.ExitCode -ne 0) {
        throw [Exception]::new("Docker cp failed with exit code $($result.ExitCode)")
    }
}

function removeDockerContainer([string]$containerName) {
    Start-Process -FilePath "C:\Program Files\Docker\Docker\resources\bin\docker" -ArgumentList @("rm", $containerName) -Wait -PassThru | Out-Null
}