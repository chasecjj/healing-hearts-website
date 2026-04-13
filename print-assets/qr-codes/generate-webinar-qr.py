import qrcode
from PIL import Image, ImageDraw

url = "https://healingheartscourse.com/go/webinar"
output_path = "qr-webinar.png"
box_size = 40
border = 2

qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=box_size,
    border=border,
)
qr.add_data(url)
qr.make(fit=True)

modules_count = qr.modules_count

img = qr.make_image(fill_color="black", back_color="white").convert("RGBA")
pixels = img.load()
w, h = img.size
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if r > 200 and g > 200 and b > 200:
            pixels[x, y] = (0, 0, 0, 0)

draw = ImageDraw.Draw(img)
bs = box_size
radius_outer = int(bs * 1.5)
radius_inner = int(bs * 0.8)
radius_center = int(bs * 0.5)

for fx, fy in [(0, 0), (modules_count - 7, 0), (0, modules_count - 7)]:
    px = (fx + border) * bs
    py = (fy + border) * bs
    draw.rectangle([px, py, px + 7 * bs - 1, py + 7 * bs - 1], fill=(0, 0, 0, 0))
    draw.rounded_rectangle(
        [px, py, px + 7 * bs, py + 7 * bs], radius=radius_outer, fill=(0, 0, 0, 255)
    )
    draw.rounded_rectangle(
        [px + bs, py + bs, px + 6 * bs, py + 6 * bs],
        radius=radius_inner,
        fill=(0, 0, 0, 0),
    )
    draw.rounded_rectangle(
        [px + 2 * bs, py + 2 * bs, px + 5 * bs, py + 5 * bs],
        radius=radius_center,
        fill=(0, 0, 0, 255),
    )

img.save(output_path)
print(f"Generated {output_path} ({w}x{h}px)")
