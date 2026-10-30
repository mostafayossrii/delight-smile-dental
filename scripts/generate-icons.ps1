Add-Type -AssemblyName System.Drawing

$sourcePath = "$PSScriptRoot\..\public\logo.png"
if (-not (Test-Path $sourcePath)) {
    Write-Error "Source logo not found at $sourcePath"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile($sourcePath)

function Create-SquareIcon {
    param(
        [System.Drawing.Image]$Image,
        [int]$Size,
        [string]$OutputPath
    )

    $dir = [System.IO.Path]::GetDirectoryName($OutputPath)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Dark luxury obsidian background matching Delight Smile branding
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 7, 7, 9))
    $graphics.FillRectangle($brush, 0, 0, $Size, $Size)

    # Calculate centered aspect ratio
    $aspect = $Image.Width / $Image.Height
    $targetWidth = $Size * 0.90
    $targetHeight = $targetWidth / $aspect

    if ($targetHeight -gt ($Size * 0.90)) {
        $targetHeight = $Size * 0.90
        $targetWidth = $targetHeight * $aspect
    }

    $x = ($Size - $targetWidth) / 2
    $y = ($Size - $targetHeight) / 2

    $graphics.DrawImage($Image, [int]$x, [int]$y, [int]$targetWidth, [int]$targetHeight)

    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bmp.Dispose()
    Write-Host "Created icon: $OutputPath ($Size x $Size)"
}

# 1. PWA & Web Icons
Create-SquareIcon $srcImage 192 "$PSScriptRoot\..\public\icon-192.png"
Create-SquareIcon $srcImage 512 "$PSScriptRoot\..\public\icon-512.png"
Create-SquareIcon $srcImage 180 "$PSScriptRoot\..\public\apple-touch-icon.png"

# 2. Android Mipmap Icons
$androidRes = "$PSScriptRoot\..\flutter_app\android_icons"
Create-SquareIcon $srcImage 48 "$androidRes\mipmap-mdpi\ic_launcher.png"
Create-SquareIcon $srcImage 72 "$androidRes\mipmap-hdpi\ic_launcher.png"
Create-SquareIcon $srcImage 96 "$androidRes\mipmap-xhdpi\ic_launcher.png"
Create-SquareIcon $srcImage 144 "$androidRes\mipmap-xxhdpi\ic_launcher.png"
Create-SquareIcon $srcImage 192 "$androidRes\mipmap-xxxhdpi\ic_launcher.png"

# Also round launcher icons
Create-SquareIcon $srcImage 48 "$androidRes\mipmap-mdpi\ic_launcher_round.png"
Create-SquareIcon $srcImage 72 "$androidRes\mipmap-hdpi\ic_launcher_round.png"
Create-SquareIcon $srcImage 96 "$androidRes\mipmap-xhdpi\ic_launcher_round.png"
Create-SquareIcon $srcImage 144 "$androidRes\mipmap-xxhdpi\ic_launcher_round.png"
Create-SquareIcon $srcImage 192 "$androidRes\mipmap-xxxhdpi\ic_launcher_round.png"

# 3. iOS AppIcon.appiconset
$iosIconSet = "$PSScriptRoot\..\flutter_app\ios\Runner\Assets.xcassets\AppIcon.appiconset"
$iosSizes = @(20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024)
foreach ($s in $iosSizes) {
    Create-SquareIcon $srcImage $s "$iosIconSet\Icon-App-$s.png"
}

# 4. Master 1024x1024 icon for stores & Flutter assets
Create-SquareIcon $srcImage 1024 "$PSScriptRoot\..\flutter_app\assets\app_icon_1024.png"

$srcImage.Dispose()
Write-Host "All icons generated successfully!"
