"""
Exports the master RentSure icon into every size Android, iOS, and the
web app need, and writes them directly into each project's resource folders.
"""
from PIL import Image
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))  # RentSure/

master = Image.open(os.path.join(HERE, "icon-master-1024.png"))
round_master = Image.open(os.path.join(HERE, "icon-round-master-1024.png"))


def save(img, path, size):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.resize((size, size), Image.LANCZOS).save(path)


# --- Android mipmaps (square + round) ---
ANDROID_RES = os.path.join(ROOT, "mobile", "android", "app", "src", "main", "res")
ANDROID_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}
for folder, size in ANDROID_SIZES.items():
    save(master, os.path.join(ANDROID_RES, folder, "ic_launcher.png"), size)
    save(round_master, os.path.join(ANDROID_RES, folder, "ic_launcher_round.png"), size)

# --- iOS AppIcon set (added now, used whenever Xcode/CocoaPods is set up) ---
IOS_ICONSET = os.path.join(
    ROOT, "mobile", "ios", "RentSureMobile", "Images.xcassets", "AppIcon.appiconset"
)
IOS_SIZES = [20, 29, 40, 60, 58, 87, 80, 120, 180, 1024]
for size in IOS_SIZES:
    save(master, os.path.join(IOS_ICONSET, f"icon-{size}.png"), size)

# --- Web favicons (Next.js frontend) ---
WEB_PUBLIC = os.path.join(ROOT, "frontend", "public")
for size in [16, 32, 48, 192, 512]:
    save(master, os.path.join(WEB_PUBLIC, f"favicon-{size}.png"), size)
save(master, os.path.join(WEB_PUBLIC, "apple-touch-icon.png"), 180)

# Next.js App Router picks up src/app/icon.png and src/app/apple-icon.png automatically
APP_DIR = os.path.join(ROOT, "frontend", "src", "app")
save(master, os.path.join(APP_DIR, "icon.png"), 512)
save(master, os.path.join(APP_DIR, "apple-icon.png"), 180)

# --- PlayStore / App Store listing assets (high-res, not bundled in the app) ---
STORE_DIR = os.path.join(ROOT, "assets", "icon", "store")
save(master, os.path.join(STORE_DIR, "playstore-icon-512.png"), 512)
save(master, os.path.join(STORE_DIR, "appstore-icon-1024.png"), 1024)

print("All icon sizes exported.")
