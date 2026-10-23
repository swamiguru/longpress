#!/usr/bin/env python3
"""Hero and body illustrations for Fine Print pieces (Gemini image model).

    python3 scripts/og/illustrate.py <slug> [hero|body|both] [--force]

Reads the visual idea for each image from scripts/og/fp-subjects.json:
    { "<slug>": { "hero": "<one visual metaphor>", "body": "<a different one>" } }

Writes public/images/fine-print/<slug>-hero.webp and <slug>-body.webp
(1600x900) plus a -800w.webp of each. Then add heroImage, heroImageAlt,
bodyImage, bodyImageAlt to the piece's frontmatter.

Costs money: one image call per file, on the GEMINI_API_KEY from
~/Builtbyswami-website/.env (or the environment). It stops on the first 429
so a spend cap is never hammered. It skips files that already exist.
"""
import base64
import json
import os
import sys
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/images/fine-print"
SUBJECTS = Path(__file__).resolve().parent / "fp-subjects.json"
MODEL = os.environ.get("LP_GEMINI_MODEL", "gemini-nano-banana-2.1")
W, H = 1600, 900


def api_key():
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    for env in (Path.home() / "Builtbyswami-website/.env", ROOT / ".env"):
        if env.exists():
            for line in env.read_text().splitlines():
                if line.startswith("GEMINI_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("No GEMINI_API_KEY in the environment or ~/Builtbyswami-website/.env")


def prompt_for(subject):
    return f"""Simple flat editorial illustration for a plain-language explainer
about an Indian rule or fee. Wide 16:9 landscape, full-bleed, filling the
whole frame edge to edge.

Background: ONE flat, matte, opaque warm off-white, #FAF9F4, edge to edge. No
gradient, vignette, border, panel or rounded card.

Subject: ONE clear, witty visual metaphor, drawn as a simple flat vector and
centred, filling about 60 percent of the frame: {subject}.
Build it from 3 to 6 large geometric shapes with confident near-black outlines
(#111111) and flat fills. Use ONLY these colours: highlighter yellow #FFE14D,
near-black #111111, warm grey #D9D5C6 and the off-white background. Yellow is
the accent and should be on the one thing the viewer must notice. No small
detail. Prefer everyday objects (a key, lock, scale, plug, coin, hourglass,
door, drawer, tap, scissors, ladder, funnel) over devices.

Never draw screens, phones or laptops showing an interface, keyboards,
dashboards, charts, documents, forms, signs, banners, packaging, logos, flags,
currency notes or any object that normally carries writing. No real people, no
faces, no hands, no real brand marks.

Signature motif: a small asterisk of three crossing rounded bars in
near-black in ONE corner (about a tenth of the frame width). Nothing else
scattered.

No text of any kind: no words, letters, numbers, symbols, captions or labels.
Flat vector only: no photorealism, no shadows, no gradients, no 3D.
"""


def call(prompt, key, image_size):
    cfg = {"aspectRatio": "16:9"}
    if image_size:
        cfg["imageSize"] = image_size
    body = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": cfg},
    }).encode()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={key}"
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = json.load(resp)
    for cand in data.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            inline = part.get("inlineData")
            if inline and inline.get("data"):
                return base64.b64decode(inline["data"])
    return None


def save(img_bytes, base):
    im = Image.open(BytesIO(img_bytes)).convert("RGB")
    # Cover-crop to exactly 16:9, then size to 1600x900.
    target = W / H
    w, h = im.size
    if w / h > target:
        nw = int(h * target)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / target)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    full = im.resize((W, H), Image.LANCZOS)
    full.save(OUT / f"{base}.webp", "WEBP", quality=82, method=6)
    full.resize((800, 450), Image.LANCZOS).save(OUT / f"{base}-800w.webp", "WEBP", quality=82, method=6)
    print(f"wrote public/images/fine-print/{base}.webp (+ -800w), source {w}x{h}")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    if not args:
        sys.exit(__doc__)
    slug = args[0]
    kinds = ["hero", "body"] if len(args) < 2 or args[1] == "both" else [args[1]]
    subjects = json.loads(SUBJECTS.read_text()).get(slug)
    if not subjects:
        sys.exit(f"No entry for {slug} in {SUBJECTS.name}")
    key = api_key()
    OUT.mkdir(parents=True, exist_ok=True)
    for kind in kinds:
        base = f"{slug}-{kind}"
        if (OUT / f"{base}.webp").exists() and not force:
            print(f"skip {base}: exists (use --force)")
            continue
        got = None
        for size in ("2K", None):
            try:
                got = call(prompt_for(subjects[kind]), key, size)
            except Exception as e:  # noqa: BLE001
                print(f"{base}: attempt with imageSize={size} failed ({e})", file=sys.stderr)
                if "429" in str(e):
                    sys.exit("429: cap or rate limit. Stopping so the cap is not hammered.")
                continue
            if got:
                break
        if not got:
            print(f"{base}: no image returned", file=sys.stderr)
            continue
        save(got, base)


if __name__ == "__main__":
    main()
