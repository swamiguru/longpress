#!/usr/bin/env python3
"""Headline share cards (1200x630) for the Daily Five, where no illustration exists.

Two kinds, both in public/images/daily-cards/:
  <date>.png         the whole brief, for briefs with no illustration folder
                     (everything before CARDS_FROM, 13 Sept 2026)
  <date>-<slot>.png  one story, for the per-story share pages
                     (/daily/<date>/<slot>) when that item has no image

Same identity as the hub cards (scripts/og/hub-cards.py): midnight ground,
orange bar, ring-and-dot mark, @longpressnews. Committed PNGs, because the
Vercel build has no fonts. Existing files are kept unless --force, so a new
day only adds its own cards.

    python3 scripts/og/brief-cards.py [--force]
"""
import json
import subprocess
import sys
from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import importlib.util

_spec = importlib.util.spec_from_file_location("hub", Path(__file__).resolve().parent / "hub-cards.py")
hub = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(hub)

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/images/daily-cards"
DAILY_IMAGES = ROOT / "public/images/daily"
FORCE = "--force" in sys.argv

# The brief files are YAML frontmatter; js-yaml ships with Astro, so read them in node.
READ_BRIEFS = r"""
import fs from 'node:fs';
import yaml from 'js-yaml';
const dir = 'src/content/daily';
const out = [];
for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.md')).sort()) {
  const fm = fs.readFileSync(`${dir}/${f}`, 'utf8').split(/^---\s*$/m)[1];
  const d = yaml.load(fm, { schema: yaml.JSON_SCHEMA });
  if (d.draft) continue;
  out.push({
    date: f.replace(/\.md$/, ''),
    title: d.title,
    items: (d.items || []).map((i) => ({ slot: i.slot, heading: i.heading, image: i.image || null, story: i.story || null })),
  });
}
console.log(JSON.stringify(out));
"""


def briefs():
    res = subprocess.run(["node", "--input-type=module", "-e", READ_BRIEFS], cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def has_lead(day):
    """Mirror of pickBriefLead() in src/lib/seo/og.mjs."""
    folder = DAILY_IMAGES / day
    if not folder.is_dir():
        return False
    return any(p.name.startswith(("illustration_", "card_")) and "-" not in p.stem.split("_", 1)[1] for p in folder.iterdir())


def nice_date(day):
    y, m, d = (int(x) for x in day.split("-"))
    return date(y, m, d).strftime("%-d %b %Y").upper()


def headline_card(tag, title, out):
    img = Image.new("RGB", (hub.W, hub.H), hub.MIDNIGHT)
    d = ImageDraw.Draw(img)
    hub.ring_mark(d, 1010, 330, 330, hub.RULE)
    d.rectangle((0, 0, 14, hub.H), fill=hub.ORANGE)

    hub.ring_mark(d, 96, 88, 22, hub.ORANGE_LIGHT, dot=hub.ORANGE)
    wm = hub.font("ExtraBold", 34)
    x = hub.tracked(d, (134, 68), "LONG", wm, hub.INK_ON_DARK, tracking=2)
    hub.tracked(d, (x, 68), "PRESS", wm, hub.ORANGE, tracking=2)

    hub.tracked(d, (80, 170), tag, hub.font("Medium", 24), hub.ORANGE_LIGHT, tracking=4)

    # Headline: the largest size that fits in four lines between the tag and the rule.
    top, bottom, width = 218, 536, 1000
    for size in range(76, 39, -2):
        tf = hub.font("ExtraBold", size)
        lines = hub.wrap(d, title, tf, width)
        lh = int(size * 1.12)
        if len(lines) <= 4 and len(lines) * lh <= bottom - top:
            break
    y = top
    for ln in lines:
        d.text((76, y), ln, font=tf, fill=hub.INK_ON_DARK)
        y += lh

    d.line((80, 560, hub.W - 80, 560), fill=hub.RULE, width=2)
    ff = hub.font("Medium", 26)
    d.text((80, 578), "@longpressnews", font=ff, fill=hub.SOFT_ON_DARK)
    label = "longpress.news"
    d.text((hub.W - 80 - d.textlength(label, font=ff), 578), label, font=ff, fill=hub.ORANGE_LIGHT)
    # Four flat colours plus anti-aliasing: a 64-colour palette is visually
    # identical and about a third of the size, which matters across ~400 cards.
    img.quantize(colors=64, method=Image.Quantize.MEDIANCUT).save(out, optimize=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    made = kept = 0
    for b in briefs():
        day, when = b["date"], nice_date(b["date"])
        jobs = []
        if not has_lead(day):
            jobs.append((OUT / f"{day}.png", f"THE DAILY FIVE  ·  {when}", b["title"]))
        n = len(b["items"])
        for it in b["items"]:
            # SVG items still need a card: no platform shows an SVG share image.
            if (it["image"] and not it["image"].lower().endswith(".svg")) or it["story"]:
                continue
            jobs.append((OUT / f"{day}-{it['slot']}.png", f"THE DAILY FIVE  ·  {when}  ·  {it['slot']} OF {n}", it["heading"]))
        for out, tag, title in jobs:
            if out.exists() and not FORCE:
                kept += 1
                continue
            headline_card(tag, title, out)
            made += 1
    print(f"daily cards: {made} made, {kept} kept, in {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
