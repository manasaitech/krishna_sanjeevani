Add-Type -AssemblyName System.IO.Compression.FileSystem

$zips = @('Surawali (Kapha).zip', 'Surawali (Pitta).zip', 'Surawali (Vata).zip')

foreach ($z in $zips) {
    if (Test-Path $z) {
        Write-Host "`n================== $z =================="
        $archive = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $z))
        foreach ($entry in $archive.Entries) {
            if (-not $entry.FullName.EndsWith('/')) {
                Write-Host ("  File: {0,-55} Size: {1,10} bytes" -f $entry.FullName, $entry.Length)
            }
        }
        $archive.Dispose()
    } else {
        Write-Host "File not found: $z"
    }
}
