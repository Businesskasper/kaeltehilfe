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

Write-Log "Starting full build" -ForegroundColor Cyan

$scripts = Get-ChildItem -Path $root -Filter "build-*.ps1" | ? { $_.Name -ne "build-all.ps1" } | sort Name

foreach ($script in $scripts) {
    Write-Log "--- Starting $($script.Name) ---" -ForegroundColor Cyan
    try {
        & $script.FullName
        Write-Log "--- Finished $($script.Name) ---" -ForegroundColor Green
    }
    catch {
        Write-Log "--- FAILED $($script.Name): $($_.Exception.Message) ---" -ForegroundColor Red
    }
}

Write-Log "Full build complete" -ForegroundColor Green
