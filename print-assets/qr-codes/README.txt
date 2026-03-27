Healing Hearts — QR Codes for Print Materials
================================================

Generated: 2026-03-27
Campaign: Be Healthy Utah Expo (April 17-18, 2026)

Each QR code points to a /go/* redirect route that can be updated
WITHOUT reprinting. The redirect destinations are in vercel.json.

FILES
-----
qr-magazine.svg / .png  — For quarter-page magazine ad
qr-banner.svg / .png    — For retractable banner
qr-magnet.svg / .png    — For 2x3 business card magnets
qr-swag.svg / .png      — For 5x7 insert card in swag bags
qr-keynote.svg / .png   — For Trisha's keynote presentation slide
qr-site.svg / .png      — Generic "visit our website" (homepage)

CURRENT DESTINATIONS (as of 2026-03-27)
-----------------------------------------
/go/magazine  → /spark  (7-Day Spark Challenge signup)
/go/banner    → /spark
/go/magnet    → /spark
/go/swag      → /spark
/go/keynote   → /spark  (may change to /conference before Apr 16)
/go/site      → /       (homepage)

FOR DESIGNERS (Desirae)
------------------------
- Use SVG files for print (scales to any size without pixelation)
- PNG files are 1800x1800px backup (~6 inches at 300dpi)
- Error correction: HIGH (30%) — safe to overlay a small logo in the center
- QR codes are black on white. Colorize in your design tool if needed.
- Minimum print size: 1 inch (2.5cm) for reliable scanning

TO CHANGE A DESTINATION
------------------------
Edit vercel.json "redirects" array. Push to master. Done.
No reprinting needed — the QR code stays the same.
