Healing Hearts — QR Codes for Print Materials
================================================

Each QR code points to a /go/* redirect route that can be updated
WITHOUT reprinting. The redirect destinations are in vercel.json.

FILES
-----
qr-magazine.svg / .png  — Quarter-page magazine ad (Be Healthy Utah Expo, April 2026)
qr-banner.svg / .png    — Retractable banner
qr-magnet.svg / .png    — 2x3 business card magnets
qr-swag.svg / .png      — 5x7 insert card in swag bags
qr-keynote.svg / .png   — Trisha's keynote presentation slide
qr-site.svg / .png      — Generic "visit our website" (homepage)
qr-card.png             — Business card
qr-programs.png         — Vendor flyer → /programs
qr-webinar.png          — Webinar promo → /webinar
qr-apply.png            — Application QR → /apply (added 2026-04-23)

CURRENT DESTINATIONS
---------------------
/go/magazine  → /spark-challenge  (expo_april2026 campaign)
/go/banner    → /spark-challenge
/go/magnet    → /spark-challenge
/go/swag      → /spark-challenge
/go/keynote   → /spark-challenge
/go/card      → /                 (business_card)
/go/site      → /                 (print)
/go/programs  → /programs         (vendor_flyer)
/go/webinar   → /webinar          (webinar_banner)
/go/apply     → /apply            (application_qr) — durable campaign, reusable across print

FOR DESIGNERS (Desirae)
------------------------
- Use SVG files for print (scales to any size without pixelation)
- PNG files are high-res backup (typically 1600-1800px, ~5-6 inches at 300dpi)
- Error correction: HIGH (30%) — safe to overlay a small logo in the center
- QR codes are black on a TRANSPARENT background. Colorize/recolor in your design tool if needed.
- Minimum print size: 1 inch (2.5cm) for reliable scanning

TO CHANGE A DESTINATION
------------------------
Edit the corresponding entry in vercel.json "redirects" array. Push to master. Done.
No reprinting needed — the QR code stays the same.

TO ADD A NEW QR
---------------
1. Copy generate-webinar-qr.py (or generate-apply-qr.py) to generate-<slug>-qr.py
2. Change `url` to `https://healingheartscourse.com/go/<slug>`
3. Change `output_path` to `qr-<slug>.png`
4. Add the /go/<slug> redirect to vercel.json with appropriate UTM params
5. Run: `cd print-assets/qr-codes && python generate-<slug>-qr.py`
6. Update this README with the new file + destination

UTM CONVENTIONS
---------------
- utm_source: where the scan happened (magazine_ad, business_card, vendor_flyer, print...)
- utm_medium: always `qr` for these codes
- utm_campaign: event-scoped (expo_april2026) OR durable slug (application_qr) — use durable for
  assets that will be reused beyond a single event.
