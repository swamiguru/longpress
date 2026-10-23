#!/usr/bin/env python3
"""Share cards for the Daily Five and Known Issue hubs (1200x630).

Long Press identity: midnight ground, orange accent, ring-and-dot mark.
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
MIDNIGHT = (23, 24, 46)
ORANGE = (224, 85, 43)
ORANGE_LIGHT = (255, 157, 122)
INK_ON_DARK = (239, 237, 245)
SOFT_ON_DARK = (185, 182, 200)
RULE = (58, 59, 85)

# Copy is lifted verbatim from the live pages (see src/pages/daily and known-issue).
CARDS = {
    "daily": {
        "tag": "THE MORNING BRIEF  ·  EVERY DAY",
        "title": "The Daily Five",
        "line": ("Five tech stories every morning, each one told the same way: "
                 "the problem, what changed, the catch, and what it means for you."),
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


def card(spec, out):
    img = Image.new("RGB", (W, H), MIDNIGHT)
    d = ImageDraw.Draw(img)

    # Large faint ring bleeding off the right edge.
    ring_mark(d, 1010, 330, 330, RULE)

    # Orange bar on the left edge, like the site's section masthead.
    d.rectangle((0, 0, 14, H), fill=ORANGE)

    # Wordmark: small ring mark + LONGPRESS.
    ring_mark(d, 96, 88, 22, ORANGE_LIGHT, dot=ORANGE)
    wm = font("ExtraBold", 34)
    x = tracked(d, (134, 68), "LONG", wm, INK_ON_DARK, tracking=2)
    tracked(d, (x, 68), "PRESS", wm, ORANGE, tracking=2)

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
        out = OUT / f"{slug}.png"
        card(spec, out)
        print(f"wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
