Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$OutDir = Join-Path $Root "visuels"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$CoverPath = "C:\Users\BATIBOO SARL\Downloads\ChatGPT Image 9 mai 2026, 15_06_04.png"
$LogoPath = "C:\Users\BATIBOO SARL\Downloads\ChatGPT Image 5 mai 2026, 09_58_16.png"
$Page3Path = "D:\page bd en couleur\page 3.png"
$Page4Path = "D:\page bd en couleur\page 4.png"
$Page5Path = "D:\page bd en couleur\page 5.png"
$Page7Path = "D:\page bd en couleur\page 7.png"

$Navy = [System.Drawing.Color]::FromArgb(7, 22, 58)
$DeepNavy = [System.Drawing.Color]::FromArgb(3, 11, 34)
$Gold = [System.Drawing.Color]::FromArgb(245, 188, 42)
$LightGold = [System.Drawing.Color]::FromArgb(255, 236, 154)
$Red = [System.Drawing.Color]::FromArgb(223, 20, 20)
$White = [System.Drawing.Color]::White
$Black = [System.Drawing.Color]::FromArgb(20, 24, 32)

function New-Font($name, $size, $style = [System.Drawing.FontStyle]::Regular) {
  return [System.Drawing.Font]::new($name, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
}

function New-Canvas($w, $h) {
  $bmp = [System.Drawing.Bitmap]::new($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  return @($bmp, $g)
}

function Add-RoundedRect($g, $rect, $radius, $brush, $pen = $null) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $radius * 2
  $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $g.FillPath($brush, $path)
  if ($pen -ne $null) { $g.DrawPath($pen, $path) }
  $path.Dispose()
}

function Add-Text($g, $text, $x, $y, $w, $h, $font, $color, $align = "Near", $valign = "Near") {
  $fmt = [System.Drawing.StringFormat]::new()
  $fmt.Alignment = [System.Drawing.StringAlignment]::$align
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::$valign
  $fmt.Trimming = [System.Drawing.StringTrimming]::Word
  $fmt.FormatFlags = 0
  $brush = [System.Drawing.SolidBrush]::new($color)
  $g.DrawString($text, $font, $brush, [System.Drawing.RectangleF]::new($x, $y, $w, $h), $fmt)
  $brush.Dispose()
  $fmt.Dispose()
}

function Add-CenteredTextFit($g, $text, $rect, $fontName, $startSize, $minSize, $style, $color) {
  for ($size = $startSize; $size -ge $minSize; $size -= 2) {
    $font = New-Font $fontName $size $style
    $measure = $g.MeasureString($text, $font, $rect.Width)
    if ($measure.Width -le $rect.Width -and $measure.Height -le $rect.Height) {
      Add-Text $g $text $rect.X $rect.Y $rect.Width $rect.Height $font $color "Center" "Center"
      $font.Dispose()
      return
    }
    $font.Dispose()
  }
  $font = New-Font $fontName $minSize $style
  Add-Text $g $text $rect.X $rect.Y $rect.Width $rect.Height $font $color "Center" "Center"
  $font.Dispose()
}

function Add-GradientBackground($g, $w, $h) {
  $rect = [System.Drawing.Rectangle]::new(0, 0, $w, $h)
  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $rect,
    [System.Drawing.Color]::FromArgb(2, 10, 32),
    [System.Drawing.Color]::FromArgb(14, 43, 98),
    35
  )
  $g.FillRectangle($brush, $rect)
  $brush.Dispose()

  $goldBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(38, 245, 188, 42))
  $g.FillEllipse($goldBrush, -180, -160, 520, 520)
  $g.FillEllipse($goldBrush, $w - 270, $h - 240, 520, 520)
  $goldBrush.Dispose()
}

function Add-Logo($g, $x, $y, $w) {
  $logo = [System.Drawing.Image]::FromFile($LogoPath)
  $ratio = $logo.Height / $logo.Width
  $h = [int]($w * $ratio)
  $rect = [System.Drawing.Rectangle]::new($x, $y, $w, $h)
  $g.DrawImage($logo, $rect)
  $logo.Dispose()
}

function Add-CoverName($img, $name) {
  $bmp = [System.Drawing.Bitmap]::new($img.Width, $img.Height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, 0, 0, $img.Width, $img.Height)

  $outer = [System.Drawing.Rectangle]::new(202, 242, 622, 130)
  $inner = [System.Drawing.Rectangle]::new(218, 258, 590, 98)
  Add-RoundedRect $g $outer 8 ([System.Drawing.SolidBrush]::new($Navy))
  Add-RoundedRect $g $inner 4 ([System.Drawing.SolidBrush]::new($Gold)) ([System.Drawing.Pen]::new($LightGold, 3))
  Add-CenteredTextFit $g $name $inner "Georgia" 82 42 ([System.Drawing.FontStyle]::Bold) $Navy
  $g.Dispose()
  return $bmp
}

function Add-ImageShadow($g, $img, $x, $y, $w, $h, $radius = 24) {
  $shadow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(95, 0, 0, 0))
  Add-RoundedRect $g ([System.Drawing.Rectangle]::new($x + 18, $y + 22, $w, $h)) $radius $shadow
  $shadow.Dispose()
  $g.DrawImage($img, [System.Drawing.Rectangle]::new($x, $y, $w, $h))
}

function Add-Badge($g, $text, $x, $y, $w, $h, $fill, $textColor) {
  Add-RoundedRect $g ([System.Drawing.Rectangle]::new($x, $y, $w, $h)) ([int]($h / 2)) ([System.Drawing.SolidBrush]::new($fill))
  $font = New-Font "Arial" 30 ([System.Drawing.FontStyle]::Bold)
  Add-Text $g $text $x $y $w $h $font $textColor "Center" "Center"
  $font.Dispose()
}

function Add-CTA($g, $text, $x, $y, $w, $h) {
  Add-RoundedRect $g ([System.Drawing.Rectangle]::new($x, $y, $w, $h)) 22 ([System.Drawing.SolidBrush]::new($Red))
  $font = New-Font "Arial" 34 ([System.Drawing.FontStyle]::Bold)
  Add-Text $g $text $x $y $w $h $font $White "Center" "Center"
  $font.Dispose()
}

function Save-Image($bmp, $name) {
  $path = Join-Path $OutDir $name
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

function New-FeedSquarePrenom {
  $coverSrc = [System.Drawing.Image]::FromFile($CoverPath)
  $cover = Add-CoverName $coverSrc "Amina"
  $coverSrc.Dispose()
  $arr = New-Canvas 1080 1080; $bmp = $arr[0]; $g = $arr[1]
  Add-GradientBackground $g 1080 1080
  Add-Logo $g 52 44 230
  Add-Badge $g "BD PERSONNALISEE" 650 54 360 58 $Gold $Navy
  Add-ImageShadow $g $cover 60 180 455 682
  $h1 = New-Font "Arial" 52 ([System.Drawing.FontStyle]::Bold)
  $h2 = New-Font "Arial" 48 ([System.Drawing.FontStyle]::Bold)
  $p = New-Font "Arial" 34 ([System.Drawing.FontStyle]::Regular)
  Add-Text $g "Prenom sur la couverture" 555 225 445 190 $h1 $White
  Add-Text $g "Votre enfant devient le heros d'une BD d'aventure." 558 420 420 170 $p $White
  Add-Badge $g "9 900 FCFA" 558 630 255 62 $LightGold $Navy
  Add-CTA $g "Commander sur WhatsApp" 558 724 412 78
  Add-Text $g "Livraison a Yaounde" 558 828 430 92 $h2 $Gold
  $g.Dispose(); $cover.Dispose()
  Save-Image $bmp "feed-carre-prenom.png"
}

function New-FeedVerticalCadeau {
  $coverSrc = [System.Drawing.Image]::FromFile($CoverPath)
  $cover = Add-CoverName $coverSrc "Joseph"
  $coverSrc.Dispose()
  $arr = New-Canvas 1080 1350; $bmp = $arr[0]; $g = $arr[1]
  Add-GradientBackground $g 1080 1350
  Add-Logo $g 64 54 210
  Add-Badge $g "CADEAU EDUCATIF" 640 62 360 58 $Gold $Navy
  $h1 = New-Font "Arial" 64 ([System.Drawing.FontStyle]::Bold)
  $p = New-Font "Arial" 34 ([System.Drawing.FontStyle]::Regular)
  Add-Text $g "Un cadeau qui le rend fier" 64 190 950 140 $h1 $White
  Add-Text $g "Une BD personnalisee avec son prenom, pensee pour les enfants curieux de 6 a 10 ans." 68 338 900 110 $p $White
  Add-ImageShadow $g $cover 330 485 420 630
  Add-Badge $g "9 900 FCFA" 96 1138 248 64 $LightGold $Navy
  Add-CTA $g "Personnaliser maintenant" 390 1132 520 76
  Add-Text $g "Livraison a Yaounde" 0 1240 1080 48 (New-Font "Arial" 38 ([System.Drawing.FontStyle]::Bold)) $Gold "Center" "Center"
  $g.Dispose(); $cover.Dispose()
  Save-Image $bmp "feed-vertical-cadeau.png"
}

function New-StoryReelsPersonnalisation {
  $coverSrc = [System.Drawing.Image]::FromFile($CoverPath)
  $cover = Add-CoverName $coverSrc "Sara"
  $coverSrc.Dispose()
  $arr = New-Canvas 1080 1920; $bmp = $arr[0]; $g = $arr[1]
  Add-GradientBackground $g 1080 1920
  Add-Logo $g 70 58 250
  Add-Badge $g "ACADEMIE DES GENIES" 520 74 470 62 $Gold $Navy
  $h1 = New-Font "Arial" 72 ([System.Drawing.FontStyle]::Bold)
  $p = New-Font "Arial" 40 ([System.Drawing.FontStyle]::Regular)
  Add-Text $g "Votre enfant devient le heros" 74 235 930 180 $h1 $White
  Add-Text $g "Son prenom apparait sur la couverture et dans l'histoire." 78 435 900 120 $p $White
  Add-ImageShadow $g $cover 280 600 520 780
  Add-Badge $g "BD personnalisee" 130 1425 360 66 $LightGold $Navy
  Add-Badge $g "9 900 FCFA" 570 1425 280 66 $Gold $Navy
  Add-CTA $g "Commander sur WhatsApp" 165 1560 750 90
  Add-Text $g "Livraison a Yaounde" 0 1700 1080 60 (New-Font "Arial" 44 ([System.Drawing.FontStyle]::Bold)) $Gold "Center" "Center"
  $g.Dispose(); $cover.Dispose()
  Save-Image $bmp "story-reels-personnalisation.png"
}

function New-CarouselCover {
  $cover = [System.Drawing.Image]::FromFile($CoverPath)
  $arr = New-Canvas 1080 1080; $bmp = $arr[0]; $g = $arr[1]
  Add-GradientBackground $g 1080 1080
  Add-Logo $g 52 44 260
  Add-ImageShadow $g $cover 70 170 430 645
  Add-Text $g "Une BD a son prenom" 545 250 450 170 (New-Font "Arial" 66 ([System.Drawing.FontStyle]::Bold)) $White
  Add-Text $g "Tome 1 - Academie des Genies" 550 445 390 90 (New-Font "Arial" 32 ([System.Drawing.FontStyle]::Regular)) $Gold
  Add-CTA $g "Decouvrir" 550 620 310 78
  Add-Text $g "9 900 FCFA" 550 730 340 60 (New-Font "Arial" 46 ([System.Drawing.FontStyle]::Bold)) $LightGold
  $g.Dispose(); $cover.Dispose()
  Save-Image $bmp "carousel-01-couverture.png"
}

function New-CarouselPrenom {
  $coverSrc = [System.Drawing.Image]::FromFile($CoverPath)
  $cover = Add-CoverName $coverSrc "Amina"
  $coverSrc.Dispose()
  $arr = New-Canvas 1080 1080; $bmp = $arr[0]; $g = $arr[1]
  Add-GradientBackground $g 1080 1080
  Add-Logo $g 52 44 260
  Add-ImageShadow $g $cover 585 170 360 540
  Add-Text $g "Son prenom sur la couverture" 78 220 470 210 (New-Font "Arial" 66 ([System.Drawing.FontStyle]::Bold)) $White
  Add-Text $g "Amina, Joseph, Sara... chaque enfant peut avoir sa version." 82 460 430 150 (New-Font "Arial" 34 ([System.Drawing.FontStyle]::Regular)) $White
  Add-Badge $g "Exemple personnalise" 80 660 370 62 $Gold $Navy
  Add-CTA $g "Creer la sienne" 80 760 360 78
  $g.Dispose(); $cover.Dispose()
  Save-Image $bmp "carousel-02-prenom.png"
}

function New-CarouselPages {
  $p3 = [System.Drawing.Image]::FromFile($Page3Path)
  $p4 = [System.Drawing.Image]::FromFile($Page4Path)
  $p7 = [System.Drawing.Image]::FromFile($Page7Path)
  $arr = New-Canvas 1080 1080; $bmp = $arr[0]; $g = $arr[1]
  Add-GradientBackground $g 1080 1080
  Add-Logo $g 52 44 220
  Add-Text $g "32 pages illustrees" 70 205 940 90 (New-Font "Arial" 62 ([System.Drawing.FontStyle]::Bold)) $White "Center" "Center"
  Add-ImageShadow $g $p3 95 340 260 390 14
  Add-ImageShadow $g $p4 410 310 260 390 14
  Add-ImageShadow $g $p7 725 340 260 390 14
  Add-Text $g "Une aventure scientifique a lire, offrir et garder." 110 810 860 95 (New-Font "Arial" 38 ([System.Drawing.FontStyle]::Regular)) $White "Center" "Center"
  Add-Badge $g "BD personnalisee" 360 930 360 62 $Gold $Navy
  $g.Dispose(); $p3.Dispose(); $p4.Dispose(); $p7.Dispose()
  Save-Image $bmp "carousel-03-pages-interieures.png"
}

function New-CarouselCommande {
  $coverSrc = [System.Drawing.Image]::FromFile($CoverPath)
  $cover = Add-CoverName $coverSrc "Sara"
  $coverSrc.Dispose()
  $arr = New-Canvas 1080 1080; $bmp = $arr[0]; $g = $arr[1]
  Add-GradientBackground $g 1080 1080
  Add-Logo $g 52 44 220
  Add-ImageShadow $g $cover 680 190 290 435
  Add-Text $g "Commande WhatsApp simple" 78 205 560 150 (New-Font "Arial" 54 ([System.Drawing.FontStyle]::Bold)) $White
  $steps = @("1. Choisissez le prenom", "2. Confirmez sur WhatsApp", "3. Recevez a Yaounde")
  $y = 410
  foreach ($step in $steps) {
    Add-Badge $g $step 86 $y 500 60 $White $Navy
    $y += 90
  }
  Add-Badge $g "9 900 FCFA" 86 715 250 64 $LightGold $Navy
  Add-CTA $g "Commander maintenant" 86 820 470 78
  $g.Dispose(); $cover.Dispose()
  Save-Image $bmp "carousel-04-commande.png"
}

New-FeedSquarePrenom
New-FeedVerticalCadeau
New-StoryReelsPersonnalisation
New-CarouselCover
New-CarouselPrenom
New-CarouselPages
New-CarouselCommande

Get-ChildItem -Path $OutDir -File | Select-Object Name, Length
