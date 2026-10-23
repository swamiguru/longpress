#!/usr/bin/env python3
"""
Fine Print share cards: 1200x630, one per piece, plus a default.

    python3 scripts/og/fine-print-cards.py            # only pieces missing a card
    python3 scripts/og/fine-print-cards.py --force    # redo all

Reads src/content/fine-print/*.md, writes public/images/fine-print/<slug>.png.
Committed on purpose: the type needs real font files, which the Vercel build
does not have. The page falls back to default.png until a piece has its card,
so the weekly draft task should run this before it opens the PR.

Identity (fine-print.css): highlighter yellow ground, ink type, Archivo.
Nothing here is Long Press midnight or orange.
"""
import re
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src/content/fine-print"
OUT = ROOT / "public/images/fine-print"
FONTS = Path(__file__).resolve().parent / "fonts"

W, H, M = 1200, 630, 64
HL, INK = (255, 225, 77), (17, 17, 17)

# The Fine Print pillar sentence, verbatim from the project instructions.
PILLAR = ("The rules, prices and service changes in India that most people skip, "
          "read from the source document and worked out in rupees.")


def font(name, size):
    return ImageFont.truetype(str(FONTS / f"Archivo-{name}.ttf"), size)


def field(text, name):
    m = re.search(rf'^{name}:\s*(?:"((?:[^"\\]|\\.)*)"|(.+?))\s*$', text, re.M)
    if not m:
        return ""
    return (m.group(1) if m.group(1) is not None else m.group(2)).replace('\\"', '"').strip()


def wrap(draw, text, fnt, width):
    lines, cur = [], ""
    for word in text.split():
        trial = f"{cur} {word}".strip()
        if draw.textlength(trial, font=fnt) <= width or not cur:
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


def asterisk(draw, cx, cy, r, fill):
    """Three rounded bars through a centre point: the Fine Print mark."""
    import math
    t = r * 0.34
    for deg in (90, 30, -30):
        a = math.radians(deg)
        dx, dy = math.cos(a) * r, math.sin(a) * r
        draw.line([(cx - dx, cy - dy), (cx + dx, cy + dy)], fill=fill, width=int(t))
        for sx in (-1, 1):
            draw.ellipse([cx + sx * dx - t / 2, cy + sx * dy - t / 2,
                          cx + sx * dx + t / 2, cy + sx * dy + t / 2], fill=fill)


def card(title, category, out):
    img = Image.new("RGB", (W, H), HL)
    d = ImageDraw.Draw(img)

    asterisk(d, M + 26, 82, 26, INK)
    tracked(d, (M + 70, 66), "FINE PRINT", font("ExtraBold", 30), INK, 4)
    if category:
        f = font("Medium", 24)
        label = category.upper()
        tw = sum(d.textlength(c, font=f) + 2 for c in label)
        x1 = W - M
        d.rounded_rectangle([x1 - tw - 36, 62, x1, 104], radius=21, outline=INK, width=3)
        tracked(d, (x1 - tw - 18, 68), label, f, INK, 2)

    head, _, sub = title.partition(": ")
    if not sub:
        head, sub = title, ""
    sub = sub[:1].upper() + sub[1:]
    maxw = W - 2 * M
    top, bottom = 150, H - 100

    # Fewest headline lines first, then the largest size that fits them.
    done = False
    for max_lines in (2, 3, 4):
        for size in range(88, 47, -4):
            hf = font("ExtraBold", size)
            hl = wrap(d, head, hf, maxw)
            lh = int(size * 1.08)
            sf = font("Medium", 36)
            sl = wrap(d, sub, sf, maxw) if sub else []
            block = len(hl) * lh + (28 + len(sl) * 46 if sl else 0)
            if len(hl) <= max_lines and len(sl) <= 3 and block <= bottom - top:
                done = True
                break
        if done:
            break
    y = top + max(0, (bottom - top - block) // 2)
    for line in hl:
        d.text((M, y), line, font=hf, fill=INK)
        y += lh
    if sl:
        y += 28
        for line in sl:
            d.text((M, y), line, font=sf, fill=INK)
            y += 46

    d.rectangle([M, H - 78, W - M, H - 75], fill=INK)
    d.text((M, H - 60), "Long Press", font=font("ExtraBold", 28), fill=INK)
    d.text((W - M - d.textlength("longpress.news/fine-print", font=font("Medium", 28)), H - 60),
           "longpress.news/fine-print", font=font("Medium", 28), fill=INK)
    img.save(out, optimize=True)


def main():
    force = "--force" in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)
    made = 0
    default = OUT / "default.png"
    if force or not default.exists():
        card("Fine Print: " + PILLAR, "", default)
        made += 1
    for md in sorted(SRC.glob("*.md")):
        text = md.read_text(encoding="utf-8")
        slug = field(text, "slug") or md.stem
        out = OUT / f"{slug}.png"
        if out.exists() and not force:
            continue
        card(field(text, "title"), field(text, "category"), out)
        made += 1
        print("  card", out.relative_to(ROOT))
    print(f"fine print cards: {made} made")


if __name__ == "__main__":
    main()
