# Converts a .docx to PDF with Word itself, so the output matches what Word
# renders rather than an approximation, and refuses anything over one page.
#
# Run with: npm run cv:pdf -- <input.docx> [output.pdf]
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$InputPath,
    [string]$OutputPath,
    [int]$MaxPages = 1
)

$ErrorActionPreference = 'Stop'

$source = (Resolve-Path -LiteralPath $InputPath).Path
if (-not $OutputPath) {
    $OutputPath = [System.IO.Path]::ChangeExtension($source, '.pdf')
}
$target = [System.IO.Path]::GetFullPath(
    [System.IO.Path]::Combine((Get-Location).Path, $OutputPath))

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
    $document = $word.Documents.Open($source, [ref]$false, [ref]$true)
    try {
        # Repaginate before counting, otherwise the statistic can be stale.
        $document.Repaginate()
        $wdStatisticPages = 2
        $pages = $document.ComputeStatistics($wdStatisticPages)

        if ($pages -gt $MaxPages) {
            throw "Document is $pages pages, expected at most $MaxPages. PDF not written."
        }

        $wdExportFormatPDF = 17
        $document.ExportAsFixedFormat($target, $wdExportFormatPDF)
        Write-Output "$pages page(s) -> $target"
    }
    finally {
        $document.Close([ref]$false)
    }
}
finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
