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

function DecryptSecureString([SecureString]$secureString) {
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureString)
    return [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
}