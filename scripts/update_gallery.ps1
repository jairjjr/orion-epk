$htmlPath = 'index.html'
$imgDir = 'media\img'
$images = Get-ChildItem -Path $imgDir -File | Where-Object { $_.Extension -match '\.(jpg|jpeg|png|webp|gif)$' }

# Construir el bloque HTML de la galería
$galleryHtml = "                <!-- GALLERY_START -->`n"
foreach ($img in $images) {
    $galleryHtml += "                <a class=`"gallery-item`" href=`"media/img/$($img.Name)`" onclick=`"event.preventDefault(); document.getElementById('lightbox-img').src=this.href; document.getElementById('lightbox').classList.add('active'); document.body.style.overflow='hidden';`">`n"
    $galleryHtml += "                    <img src=`"media/img/$($img.Name)`" alt=`"Orion Live Band - $($img.BaseName)`" loading=`"lazy`">`n"
    $galleryHtml += "                </a>`n"
}
$galleryHtml += "                <!-- GALLERY_END -->"

# Leer el HTML sin BOM
$fileContent = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)

# Reemplazar solo el bloque entre GALLERY_START y GALLERY_END
$newContent = $fileContent -replace '(?s)<!-- GALLERY_START -->.*?<!-- GALLERY_END -->', $galleryHtml

# Escribir sin BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($htmlPath, $newContent, $utf8NoBom)

Write-Host "Se encontraron y registraron $($images.Count) fotos en index.html (sin BOM)."
