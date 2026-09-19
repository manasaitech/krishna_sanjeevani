param (
    [Parameter(Mandatory=$true)]
    [string]$ZipPath,
    [Parameter(Mandatory=$true)]
    [string]$Dosha
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

if (-not (Test-Path $ZipPath)) {
    Write-Output "[]"
    exit 0
}

$resolvedPath = (Resolve-Path $ZipPath).Path
$archive = [System.IO.Compression.ZipFile]::OpenRead($resolvedPath)
$items = @()

foreach ($e in $archive.Entries) {
    if (-not $e.FullName.EndsWith('/') -and $e.Name.EndsWith('.mp3')) {
        $stream = $e.Open()
        $hasher = [System.Security.Cryptography.SHA256]::Create()
        $hashBytes = $hasher.ComputeHash($stream)
        $stream.Close()
        $hash = [BitConverter]::ToString($hashBytes).Replace('-', '').ToLower()

        $items += [PSCustomObject]@{
            dosha = $Dosha
            zipFile = [System.IO.Path]::GetFileName($ZipPath)
            entryFullName = $e.FullName
            filename = $e.Name
            size = $e.Length
            hash = $hash
        }
    }
}

$archive.Dispose()
$items | ConvertTo-Json -Compress
