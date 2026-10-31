"""Create web-sized thumbnails for every PNG/JPG in assets/figures.

Run from the project root:   python3 tools/make_thumbs.py
Requires Pillow:             pip install pillow

The full-size originals stay in assets/figures/ (they open when a visitor
clicks a figure). Pages display the lighter .webp copies in
assets/figures/thumbs/.
"""
from pathlib import Path
from PIL import Image

SRC = Path("assets/figures")
OUT = SRC / "thumbs"
MAX_WIDTH = 1100

OUT.mkdir(exist_ok=True)
for img_path in sorted(SRC.glob("*")):
    if img_path.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
        continue
    img = Image.open(img_path).convert("RGB")
    if img.width > MAX_WIDTH:
        img = img.resize((MAX_WIDTH, round(img.height * MAX_WIDTH / img.width)), Image.LANCZOS)
    target = OUT / (img_path.stem + ".webp")
    img.save(target, "WEBP", quality=82, method=6)
    print(f"{img_path.name:40s} -> {target}  ({target.stat().st_size // 1024} KB)")
