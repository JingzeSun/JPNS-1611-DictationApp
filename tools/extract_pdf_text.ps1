param(
    [Parameter(Mandatory = $true)]
    [string]$Root
)

$ErrorActionPreference = 'Stop'
$resolvedRoot = (Resolve-Path -LiteralPath $Root).Path
$outputDir = Join-Path $resolvedRoot '_extracted_text'
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    Get-ChildItem -LiteralPath $resolvedRoot -Recurse -Filter '*.pdf' | ForEach-Object {
        $pdf = $_
        $relative = $pdf.FullName.Substring($resolvedRoot.Length).TrimStart('\')
        $safeName = ($relative -replace '[\\/:*?"<>|]', '_') -replace '\.pdf$', '.txt'
        $target = Join-Path $outputDir $safeName

        Write-Host "Extracting $relative"
        $doc = $word.Documents.Open($pdf.FullName, $false, $true)
        try {
            # wdFormatUnicodeText = 7
            $doc.SaveAs2($target, 7)
        }
        finally {
            $doc.Close($false)
        }
    }
}
finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}

Write-Host "Text written to $outputDir"
