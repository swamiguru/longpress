#!/usr/bin/env python3
"""Share cards for the Daily Five and Known Issue hubs (1200x630).

Long Press identity (direction D7): warm ink ground, lime accent, lime tile
with ink ring, arc and dot, block cursor, three-band stripe in the pillar colors.
Committed PNGs, because the Vercel build has no fonts. Fine Print's hub uses
the Fine Print default card instead (scripts/og/fine-print-cards.py).

    python3 scripts/og/hub-cards.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/images/hubs"
FONTS = Path(__file__).resolve().parent / "fonts"

W, H = 1200, 630
# D7 palette. The names are kept from the old palettes so brief-cards.py and
# other callers still work: MIDNIGHT is the ground (warm ink), ORANGE is the
# accent (lime), MUSTARD is the Fine Print yellow.
MIDNIGHT = (19, 18, 24)        # ink  #131218
ORANGE = (205, 224, 99)        # lime #CDE063
ORANGE_LIGHT = (205, 224, 99)  # lime on ink, for tags and the URL
INK_ON_DARK = (246, 243, 234)  # #F6F3EA
SOFT_ON_DARK = (185, 180, 196) # #B9B4C4
RULE = (58, 56, 68)            # #3A3844
MUSTARD = (245, 192, 74)       # Fine Print yellow #F5C04A
TEAL = (25, 195, 174)          # Known Issue teal #19C3AE
TILE = (205, 224, 99)          # mark tile: lime
AMBER = (19, 18, 24)           # mark ring/dot: ink (name kept)
ARC = (19, 18, 24)             # mark arc: ink
RING_ON_TILE = (161, 175, 59)  # ink at 28% over lime

# Copy is lifted verbatim from the live pages (see src/pages/daily and known-issue).
CARDS = {
    "daily": {
        "tag": "THE MORNING BRIEF  ·  EVERY DAY",
        "title": "The Daily Five",
        "line": ("Five tech stories every morning, each one told the same way: "
                 "the problem, what changed, the catch, and what it means for you."),
    },
    "default": {
        "tag": "FIVE TECH STORIES  ·  EVERY MORNING",
        "title": "Long Press",
        "line": "Everyone else tells you what happened. We stay on it a beat longer.",
    },
    "known-issue": {
        "tag": "THE COLUMN  ·  BY SWAMI GURU",
        "title": "Known Issue",
        "line": ("The things in your phone and apps that have been wrong long enough "
                 "to count as a decision, not an oversight."),
    },
}


def font(name, size):
    return ImageFont.truetype(str(FONTS / f"Archivo-{name}.ttf"), size)


def wrap(draw, text, fnt, width):
    lines, cur = [], ""
    for word in text.split():
        trial = f"{cur} {word}".strip()
        if draw.textlength(trial, font=fnt) <= width:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def tracked(draw, xy, text, fnt, fill, tracking=3):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + tracking
    return x


def ring_mark(draw, cx, cy, r, color, dot=None):
    """Ring-and-dot mark: outer ring, dashed-feel inner ring, solid dot."""
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=color, width=max(2, r // 14))
    r2 = int(r * 0.69)
    draw.ellipse((cx - r2, cy - r2, cx + r2, cy + r2), outline=color, width=max(1, r // 22))
    r3 = int(r * 0.2)
    draw.ellipse((cx - r3, cy - r3, cx + r3, cy + r3), fill=dot or color)


def screen_mark(draw, x, y, size):
    """D7 icon: lime tile, ink ring at 28%, ink right half-arc, ink dot."""
    draw.rounded_rectangle((x, y, x + size, y + size), radius=int(size * 0.26), fill=TILE)
    cx, cy = x + size / 2, y + size / 2
    r = size * 0.27
    w = max(3, int(size * 0.07))
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=RING_ON_TILE, width=w)
    draw.arc((cx - r, cy - r, cx + r, cy + r), start=-90, end=90, fill=ARC, width=w)
    d = size * 0.1
    draw.ellipse((cx - d, cy - d, cx + d, cy + d), fill=AMBER)


def brand_header(d):
    """Left-edge three-band stripe (Daily Five, Known Issue, Fine Print), mark, wordmark, block cursor."""
    d.rectangle((0, 0, 6, H), fill=ORANGE)
    d.rectangle((10, 0, 16, H), fill=TEAL)
    d.rectangle((20, 0, 26, H), fill=MUSTARD)
    screen_mark(d, 64, 52, 56)
    wm = font("ExtraBold", 34)
    x = tracked(d, (140, 64), "LONG", wm, INK_ON_DARK, tracking=2)
    x = tracked(d, (x + 10, 64), "PRESS", wm, INK_ON_DARK, tracking=2)
    d.rectangle((x + 8, 70, x + 8 + 15, 70 + 28), fill=ORANGE)


def card(spec, out):
    img = Image.new("RGB", (W, H), MIDNIGHT)
    d = ImageDraw.Draw(img)

    # Large faint ring bleeding off the right edge.
    ring_mark(d, 1010, 330, 330, RULE)

    brand_header(d)

    # Section tag.
    tracked(d, (80, 188), spec["tag"], font("Medium", 24), ORANGE_LIGHT, tracking=4)

    # Title, shrunk to fit one line inside 900px.
    size = 128
    while size > 72:
        tf = font("ExtraBold", size)
        if d.textlength(spec["title"], font=tf) <= 900:
            break
        size -= 4
    d.text((76, 224), spec["title"], font=tf, fill=INK_ON_DARK)

    # Pillar line.
    lf = font("Medium", 34)
    y = 224 + size + 40
    for ln in wrap(d, spec["line"], lf, 860):
        d.text((80, y), ln, font=lf, fill=SOFT_ON_DARK)
        y += 46

    # Footer.
    d.line((80, 560, W - 80, 560), fill=RULE, width=2)
    ff = font("Medium", 26)
    d.text((80, 578), "@longpressnews", font=ff, fill=SOFT_ON_DARK)
    label = "longpress.news"
    d.text((W - 80 - d.textlength(label, font=ff), 578), label, font=ff, fill=ORANGE_LIGHT)

    img.save(out, optimize=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, spec in CARDS.items():
        # The site-wide default card lives at the web root, not with the hubs.
        out = (ROOT / "public/og-default.png") if slug == "default" else OUT / f"{slug}.png"
        card(spec, out)
        print(f"wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
