# Create simple original title cards, without downloading external images.
Add-Type -AssemblyName System.Drawing
$imageDirectory = Join-Path $PSScriptRoot '../public/images'
New-Item -ItemType Directory -Path $imageDirectory -Force | Out-Null
$lessons = Get-Content (Join-Path $PSScriptRoot '../data/lessons.json') -Raw | ConvertFrom-Json
$colours = @('#164E63', '#1E3A8A', '#5B21B6', '#9D174D', '#065F46')
$index = 0
foreach ($lesson in $lessons) {
    $filename = [System.IO.Path]::GetFileName($lesson.image)
    $destination = Join-Path $imageDirectory $filename
    # Preserve any images the student has already supplied.
    if (Test-Path -LiteralPath $destination) { continue }
    $bitmap = New-Object System.Drawing.Bitmap 800, 480
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $titleFont = New-Object System.Drawing.Font 'Arial', 38
    $labelFont = New-Object System.Drawing.Font 'Arial', 18
    try {
        $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml($colours[$index % $colours.Length]))
        $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
        $graphics.DrawString('AFTERCLASS', $labelFont, [System.Drawing.Brushes]::White, 48, 60)
        $graphics.DrawString($lesson.topic, $titleFont, [System.Drawing.Brushes]::White, 48, 190)
        $graphics.DrawString('Learn something new', $labelFont, [System.Drawing.Brushes]::White, 48, 360)
        $bitmap.Save($destination, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        Write-Output "Created $filename"
    } finally {
        $labelFont.Dispose()
        $titleFont.Dispose()
        $graphics.Dispose()
        $bitmap.Dispose()
    }
    $index++
}
