# Generates certificates for Kaeltehilfe use
function PrepareKaeltehilfeCerts {
    param (
        [string]$caName,
        [string]$exportPfxPath,
        [SecureString]$pfxPassword,
        [string]$exportCrtPath
    )

    # Prepare paths
    $exportPfxDir = Split-Path $exportPfxPath -Parent
    $exportCrtDir = Split-Path $exportCrtPath -Parent
    if (-not (Test-Path $exportPfxDir)) { New-Item -Path $exportPfxDir -ItemType Directory -ea 0 | Out-Null }
    if (-not (Test-Path $exportCrtDir)) { New-Item -Path $exportCrtDir -ItemType Directory -ea 0 | Out-Null }

    # Create certificate files
    Write-Host "Creating CA certificate ""$($caName)"""
    $cert = CreateSignedCertificate -signer `
                                    -commonName $caName `
                                    -exportCaPath $exportCrtPath `
                                    -exportPfxPath $exportPfxPath `
                                    -exportPfxPassword $pfxPassword

    Write-Host "Created CA certificate ""$($caName)"" ($($cert.Thumbprint))"
}

function GeneratePassword([int]$length) {
    $pw = ""
    1..$length | % {
        $case = Get-Random -Minimum 0 -Maximum 2
        if ($case -eq 0) {
            $pw += [char](Get-Random -Minimum 65 -Maximum 90)
        }
        else {
            $pw += [char](Get-Random -Minimum 97 -Maximum 122)
        }
    }
    return $pw
}

# Copies a certificate from one store to another.
function CopyCertificate([string]$certificateThumbprint, [string]$destination) {

    $sourceCert = Get-ChildItem -Path cert:\ -Recurse | ? { $_.Thumbprint -eq $certificateThumbprint } | select -First 1
    if ($null -eq $sourceCert) {
        throw [Exception]::new("Cert with thumbprint `"$($certificateThumbprint)`" not found")
    }

    $destinationStore = Get-Item -Path $destination
    $destinationStore.Open("ReadWrite") | Out-Null
    
    try {
        $destinationStore.Add($sourceCert) | Out-Null
    }
    finally {  
        $destinationStore.Close() | Out-Null
    }
        
    return Get-Item -Path ([System.IO.Path]::combine($destination, $certificateThumbprint))
}

# Creates and signes certificates.
# Example which creates a ca and signes a client and a ssl certificate:

# $rootCert = CreateSignedCertificate -signer -commonName "RootCert"
# $clientCert = CreateSignedCertificate -client -commonName "Client" -signerThumbprint $rootCert.Thumbprint
# $sslCert = CreateSignedCertificate -ssl -dnsName "site.contoso.com" -commonName "SSL" -signerThumbprint $rootCert.Thumbprint
function CreateSignedCertificate {
    param(
        [Parameter(ParameterSetName = 'Signer')]
        [switch]$signer,

        [Parameter(ParameterSetName = 'Client')]
        [switch]$client,

        [Parameter(ParameterSetName = 'SSL')]
        [switch]$ssl,

        [Parameter(Mandatory=$true)]
        [string]$commonName = $env:COMPUTERNAME,

        [string]$dnsName = "$($env:COMPUTERNAME).$($env:USERDOMAIN)",

        [Parameter(ParameterSetName = "Client")]
        [Parameter(ParameterSetName = "SSL")]
        [string]$certStore = "Cert:\LocalMachine\My",

        [string]$exportCaPath = $null,
        
        [string]$exportPfxPath = $null,

        [SecureString]$exportPfxPassword = $null,

        [Parameter(ParameterSetName = "Client", Mandatory=$true)]
        [Parameter(ParameterSetName = "SSL", Mandatory=$true)]
        [string]$signerThumbprint = $null
    )

    if ($IsLinux) {
        return CreateSignedCertificateLinux @PSBoundParameters
    } else {
        return CreateSignedCertificateWindows @PSBoundParameters
    }
}

function CreateSignedCertificateLinux {
    param(
        [Parameter(ParameterSetName = 'Signer')]
        [switch]$signer,

        [Parameter(ParameterSetName = 'Client')]
        [switch]$client,

        [Parameter(ParameterSetName = 'SSL')]
        [switch]$ssl,

        [Parameter(Mandatory=$true)]
        [string]$commonName = $env:COMPUTERNAME,

        [string]$dnsName = "$($env:COMPUTERNAME).$($env:USERDOMAIN)",

        [Parameter(ParameterSetName = "Client")]
        [Parameter(ParameterSetName = "SSL")]
        [string]$certStore = "Cert:\LocalMachine\My",

        [string]$exportCaPath = $null,
        
        [string]$exportPfxPath = $null,

        [SecureString]$exportPfxPassword = $null,

        [Parameter(ParameterSetName = "Client", Mandatory=$true)]
        [Parameter(ParameterSetName = "SSL", Mandatory=$true)]
        [string]$signerThumbprint = $null
    )

    # Linux implementation using openssl
    if ($PsCmdlet.ParameterSetName -eq "Signer") {
        Write-Debug -Message "Create CA certificate for $($commonName) on Linux"
        $keyFile = [System.IO.Path]::GetTempFileName()
        $certFile = [System.IO.Path]::GetTempFileName()
        $subj = "/CN=$commonName"
        if (-not [String]::IsNullOrWhiteSpace($dnsName)) {
            $subj += "/DNS=$dnsName"
        }
        & openssl req -x509 -newkey rsa:2048 -keyout $keyFile -out $certFile -days 730 -nodes -subj $subj
        if ($LASTEXITCODE -ne 0) { throw "openssl req failed" }

        # Compute thumbprint
        $thumbprint = & openssl x509 -in $certFile -noout -fingerprint -sha256
        if ($LASTEXITCODE -ne 0) { throw "openssl x509 fingerprint failed" }
        $thumbprint = ($thumbprint -split '=')[1].Replace(':', '').ToUpper()

        if (-not [String]::IsNullOrWhiteSpace($exportCaPath)) {
            Copy-Item $certFile $exportCaPath
        }

        if (-not [String]::IsNullOrWhiteSpace($exportPfxPath) -and -not $null -eq $exportPfxPassword) {
            $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($exportPfxPassword))
            & openssl pkcs12 -export -out $exportPfxPath -inkey $keyFile -in $certFile -passout pass:$password
            if ($LASTEXITCODE -ne 0) { throw "openssl pkcs12 failed" }
        }

        # Cleanup
        Remove-Item $keyFile, $certFile -ErrorAction SilentlyContinue

        return [PSCustomObject]@{ Thumbprint = $thumbprint }
    } else {
        throw "Non-signer certificates not implemented for Linux"
    }
}

function CreateSignedCertificateWindows {
    param(
        [Parameter(ParameterSetName = 'Signer')]
        [switch]$signer,

        [Parameter(ParameterSetName = 'Client')]
        [switch]$client,

        [Parameter(ParameterSetName = 'SSL')]
        [switch]$ssl,

        [Parameter(Mandatory=$true)]
        [string]$commonName = $env:COMPUTERNAME,

        [string]$dnsName = "$($env:COMPUTERNAME).$($env:USERDOMAIN)",

        [Parameter(ParameterSetName = "Client")]
        [Parameter(ParameterSetName = "SSL")]
        [string]$certStore = "Cert:\LocalMachine\My",

        [string]$exportCaPath = $null,
        
        [string]$exportPfxPath = $null,

        [SecureString]$exportPfxPassword = $null,

        [Parameter(ParameterSetName = "Client", Mandatory=$true)]
        [Parameter(ParameterSetName = "SSL", Mandatory=$true)]
        [string]$signerThumbprint = $null
    )

    # Windows implementation
    $p = @{
        Subject           = "CN=$($commonName)"
        KeyExportPolicy   = "Exportable"
        NotAfter          = (Get-Date).AddMonths(24)
        KeySpec           = "KeyExchange"
        HashAlgorithm     = "sha256" 
        KeyLength         = "2048"
        CertStoreLocation = "Cert:\LocalMachine\My"
    }

    if (-not [String]::IsNullOrWhiteSpace($dnsName)) {
        $p += @{
            DnsName = $dnsName
        }
    }

    if ($PsCmdlet.ParameterSetName -eq "Signer") {
        Write-Debug -Message "Create CA certificate for $($commonName)"
        $p += @{
            KeyUsage         = @("KeyEncipherment", "DigitalSignature", "CertSign", "cRLSign")
            KeyusageProperty = "All"
            TextExtension    = @("2.5.29.19 ={critical} {text}ca=1&pathlength=3")
        }
    }
    else {
        if (-not [String]::IsNullOrWhiteSpace($signerThumbprint)) {
            $signerCert = CopyCertificate -certificateThumbprint $signerThumbprint -destination "Cert:\LocalMachine\My"
            if ($null -ne $signerCert) {
                $p += @{
                    Signer = $signerCert
                }
            }
        }
        if ($PsCmdlet.ParameterSetName -eq "Client") {
            Write-Debug -Message "Create Client certificate for $($commonName)"
            $p += @{
                KeyUsage = @("KeyEncipherment", "DigitalSignature")
            }
        }
        elseif ($PsCmdlet.ParameterSetName -eq "SSL") {
            Write-Debug -Message "Create SSL certificate for $($commonName)"
        }
    }

    try {
        $cert = New-SelfSignedCertificate @p
    }
    finally {
        if ($signerCert) {
            Remove-Item -Path $signerCert.PSPath | Out-Null
        }
    }

    if (-not [String]::IsNullOrWhiteSpace($exportCaPath)) {
        Write-Debug -Message "Export certificate without private key to `"$($exportCaPath)`""
        Export-Certificate -Cert $cert -FilePath $exportCaPath | Out-Null
    }

    if (-not [String]::IsNullOrWhiteSpace($exportPfxPath) -and -not $null -eq $exportPfxPassword) {
        Write-Debug -Message "Export certificate with private key to `"$($exportPfxPath)`""
        Export-PfxCertificate -Cert $cert -FilePath $exportPfxPath -Password $exportPfxPassword | Out-Null
    }

    if ($PsCmdlet.ParameterSetName -eq "Signer") {
        Write-Debug -Message "Move certificate to `"Cert:\LocalMachine\Root`""
        Move-Item -Path ([System.IO.Path]::combine("Cert:\LocalMachine\My", $cert.Thumbprint)) -Destination "Cert:\LocalMachine\Root" | Out-Null
    }
    elseif (
        (-not [String]::IsNullOrWhiteSpace($certStore) -and (Test-Path -Path $certStore)) -and 
        ($cert.PSParentPath -ne (Get-Item -Path $certStore).PSPath)
    ) {
        Write-Debug -Message "Move certificate to `"$($certStore)`""
        Move-Item -Path ([System.IO.Path]::combine("Cert:\LocalMachine\My", $cert.Thumbprint)) -Destination $certStore | Out-Null
    }

    return Get-ChildItem -Path "Cert:\LocalMachine" -Recurse | ? { $_.Thumbprint -eq $cert.Thumbprint } | select -First 1
}