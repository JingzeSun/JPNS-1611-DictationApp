param(
    [Parameter(Mandatory = $true)]
    [string]$Root
)

$ErrorActionPreference = 'Stop'
$resolvedRoot = (Resolve-Path -LiteralPath $Root).Path
$toolsDir = Join-Path $resolvedRoot 'tools'
$installDir = Join-Path $toolsDir 'poppler'
$archivePath = Join-Path $toolsDir 'Release-26.02.0-0.zip'
$downloadUrl = 'https://github.com/oschwartz10612/poppler-windows/releases/download/v26.02.0-0/Release-26.02.0-0.zip'

New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null

Write-Host 'Downloading Poppler 26.02.0-0...'
Invoke-WebRequest -Uri $downloadUrl -OutFile $archivePath

if (Test-Path -LiteralPath $installDir) {
    throw "Install directory already exists: $installDir"
}

Write-Host 'Extracting Poppler...'
Expand-Archive -LiteralPath $archivePath -DestinationPath $installDir

$pdftotext = Get-ChildItem -LiteralPath $installDir -Recurse -Filter 'pdftotext.exe' | Select-Object -First 1
if (-not $pdftotext) {
    throw 'Installation completed, but pdftotext.exe was not found.'
}

Write-Host "Installed: $($pdftotext.FullName)"
& $pdftotext.FullName -v
