"""
Generates the RentSure app icon (shield + house = "your tenancy, protected")
and exports every size needed for Android, iOS, and web favicons.
"""
from PIL import Image, ImageDraw
import math
import os

SIZE = 1024
BLUE = (37, 99, 235)        # #2563eb — same brand blue used across web/mobile
BLUE_DARK = (29, 78, 216)   # #1d4ed8 — gradient shade
WHITE = (255, 255, 255)

OUT_DIR = os.path.dirname(os.path.abspath(__file__))


def lerp(a, b, t):
    return a + (b - a) * t


def make_master():
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded-square background with a vertical gradient (blue -> darker blue)
    radius = int(SIZE * 0.22)
    bg = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    for y in range(SIZE):
        t = y / SIZE
        r = int(lerp(BLUE[0], BLUE_DARK[0], t))
        g = int(lerp(BLUE[1], BLUE_DARK[1], t))
        b = int(lerp(BLUE[2], BLUE_DARK[2], t))
        bg_draw.line([(0, y), (SIZE, y)], fill=(r, g, b, 255))

    mask = Image.new("L", (SIZE, SIZE), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([(0, 0), (SIZE, SIZE)], radius=radius, fill=255)
    img.paste(bg, (0, 0), mask)

    cx, cy = SIZE // 2, int(SIZE * 0.53)

    # Shield outline (protection symbol)
    shield_w = SIZE * 0.46
    shield_h = SIZE * 0.52
    top = cy - shield_h / 2
    left = cx - shield_w / 2
    right = cx + shield_w / 2
    bottom = cy + shield_h / 2

    shield_points = [
        (left, top),
        (right, top),
        (right, top + shield_h * 0.45),
        (cx, bottom),
        (left, top + shield_h * 0.45),
    ]
    draw.polygon(shield_points, fill=WHITE)
    # Soften the top corners of the shield
    corner_r = shield_w * 0.12
    draw.rectangle([left, top, left + corner_r, top + corner_r], fill=(0, 0, 0, 0))

    # House glyph inside the shield (roof triangle + body) in brand blue
    house_w = shield_w * 0.52
    house_h = shield_h * 0.42
    hcx, hcy = cx, cy - shield_h * 0.03

    roof_top = (hcx, hcy - house_h * 0.55)
    roof_left = (hcx - house_w / 2, hcy - house_h * 0.05)
    roof_right = (hcx + house_w / 2, hcy - house_h * 0.05)
    draw.polygon([roof_top, roof_left, roof_right], fill=BLUE)

    body_left = hcx - house_w * 0.36
    body_right = hcx + house_w * 0.36
    body_top = hcy - house_h * 0.05
    body_bottom = hcy + house_h * 0.55
    draw.rectangle([body_left, body_top, body_right, body_bottom], fill=BLUE)

    # Door (white cut-out)
    door_w = house_w * 0.22
    door_h = house_h * 0.32
    draw.rectangle(
        [hcx - door_w / 2, body_bottom - door_h, hcx + door_w / 2, body_bottom],
        fill=WHITE,
    )

    return img


def export(img, path, size):
    img.resize((size, size), Image.LANCZOS).save(path)


def make_round_mask(img):
    size = img.size[0]
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([(0, 0), (size, size)], fill=255)
    out = img.copy()
    out.putalpha(mask)
    return out


master = make_master()
master.save(os.path.join(OUT_DIR, "icon-master-1024.png"))

# Circular variant for ic_launcher_round / iOS-style rounded preview
round_master = make_round_mask(master)
round_master.save(os.path.join(OUT_DIR, "icon-round-master-1024.png"))

# --- Web favicon sizes ---
for s in [16, 32, 48, 192, 512]:
    export(master, os.path.join(OUT_DIR, f"favicon-{s}.png"), s)
export(master, os.path.join(OUT_DIR, "apple-touch-icon.png"), 180)

print("Master icons generated in", OUT_DIR)
