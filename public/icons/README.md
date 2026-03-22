# PWA Icons

This directory should contain PWA icons in the following sizes:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## How to Generate Icons

1. Create a 512x512 source image with your app logo
2. Use an online tool like https://realfavicongenerator.net/
3. Or use ImageMagick:
   convert source.png -resize 72x72 icon-72x72.png
   convert source.png -resize 96x96 icon-96x96.png
   convert source.png -resize 128x128 icon-128x128.png
   convert source.png -resize 144x144 icon-144x144.png
   convert source.png -resize 152x152 icon-152x152.png
   convert source.png -resize 192x192 icon-192x192.png
   convert source.png -resize 384x384 icon-384x384.png
   convert source.png -resize 512x512 icon-512x512.png

## Design Guidelines

- Use a simple, recognizable design
- Ensure the icon works at small sizes (72x72)
- Use the app's accent color (#10b981) prominently
- Make icons "maskable" (safe area in center)
- Test on both light and dark backgrounds
