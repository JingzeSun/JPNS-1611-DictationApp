param(
    [Parameter(Mandatory = $true)]
    [string]$Root
)

$ErrorActionPreference = 'Stop'
$resolvedRoot = (Resolve-Path -LiteralPath $Root).Path
$outputDir = Join-Path $resolvedRoot '_extracted_text'
$pdftotext = Get-ChildItem -LiteralPath (Join-Path $resolvedRoot 'tools\poppler') -Recurse -Filter 'pdftotext.exe' | Select-Object -First 1

if (-not $pdftotext) {
    throw 'pdftotext.exe was not found under tools\poppler.'
}

New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

Get-ChildItem -LiteralPath $resolvedRoot -Recurse -Filter '*.pdf' |
    Where-Object { $_.FullName -notlike "$outputDir*" } |
    ForEach-Object {
        $relative = $_.FullName.Substring($resolvedRoot.Length).TrimStart('\')
        $safeName = ($relative -replace '[\\/:*?"<>|]', '_') -replace '\.pdf$', '.txt'
        $target = Join-Path $outputDir $safeName
        Write-Host "Extracting $relative"
        & $pdftotext.FullName -layout -enc UTF-8 $_.FullName $target
        if ($LASTEXITCODE -ne 0) {
            throw "pdftotext failed for $relative with exit code $LASTEXITCODE"
        }
    }

Write-Host "Text written to $outputDir"
