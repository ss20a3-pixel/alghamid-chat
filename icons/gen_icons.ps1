Add-Type -AssemblyName System.Drawing

$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)
$outDir = "C:\Users\dell\.verdent\verdent-projects\new-project\voicechat-app\icons"

foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $radius = [int]($size * 0.22)

    $c1 = [System.Drawing.Color]::FromArgb(255, 124, 58, 237)
    $c2 = [System.Drawing.Color]::FromArgb(255, 236, 72, 153)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($size, $size),
        $c1, $c2
    )

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $path.AddArc(0, 0, $d, $d, 180, 90)
    $path.AddArc($size - $d, 0, $d, $d, 270, 90)
    $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
    $path.AddArc(0, $size - $d, $d, $d, 90, 90)
    $path.CloseFigure()

    $g.FillPath($brush, $path)

    $white = [System.Drawing.Color]::White
    $micPen = New-Object System.Drawing.Pen($white, [float]($size * 0.04))
    $micPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $micPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $micBrush = New-Object System.Drawing.SolidBrush($white)

    $mw = [int]($size * 0.22)
    $mh = [int]($size * 0.32)
    $mx = [int](($size - $mw) / 2)
    $my = [int]($size * 0.18)
    $mr = [int]($mw * 0.5)

    $micPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $md = $mr * 2
    $micPath.AddArc($mx, $my, $md, $md, 180, 180)
    $micPath.AddLine($mx + $mw, $my + $mr, $mx + $mw, $my + $mh - $mr)
    $micPath.AddArc($mx, $my + $mh - $md, $md, $md, 0, 180)
    $micPath.CloseFigure()
    $g.FillPath($micBrush, $micPath)

    $arcMargin = [int]($size * 0.18)
    $arcW = $size - $arcMargin * 2
    $arcH = [int]($size * 0.22)
    $arcTop = [int]($size * 0.42)
    $g.DrawArc($micPen, $arcMargin, $arcTop, $arcW, $arcH, 0, 180)

    $lineX = [int]($size / 2)
    $lineY1 = [int]($size * 0.53)
    $lineY2 = [int]($size * 0.72)
    $g.DrawLine($micPen, $lineX, $lineY1, $lineX, $lineY2)

    $baseW = [int]($size * 0.28)
    $baseX1 = [int](($size - $baseW) / 2)
    $baseX2 = $baseX1 + $baseW
    $baseY = [int]($size * 0.72)
    $g.DrawLine($micPen, $baseX1, $baseY, $baseX2, $baseY)

    $outPath = "$outDir\icon-$size.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $micPen.Dispose()
    $micBrush.Dispose()
    $micPath.Dispose()
    $brush.Dispose()
    $path.Dispose()
    $g.Dispose()
    $bmp.Dispose()

    Write-Host "Created: icon-$size.png"
}
