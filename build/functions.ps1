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

function buildDockerImage([string]$dockerFileDir, [string]$dockerImageName, [string[]]$buildArgs) {
    $argumentList = @("build", ".", "-t", $dockerImageName)
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

function EnsureHostsEntry([string]$domain, [string]$ip) {
    $hostsPath = "C:\Windows\System32\drivers\etc\hosts"
    $entry = "$($ip) $($domain)"

    $hostsContent = Get-Content -Path $hostsPath
    if ($hostsContent -like "*$($entry)*") {
        return
    }

    $tempDir = [System.IO.Path]::Combine($env:TEMP, [Guid]::NewGuid().Guid)
    New-Item -Path $tempDir -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
    
    $tempHostsPath = [System.IO.Path]::Combine($tempDir, "hosts")
    $hostsContent + [System.Environment]::NewLine + $entry  | Out-File -FilePath $tempHostsPath -Append -Force -NoClobber | Out-Null

    Move-Item -Path $tempHostsPath -Destination $hostsPath -Force 
}