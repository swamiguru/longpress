# Task: header/footer readability patch

Edit exactly one file: `src/styles/global.css`. Do not touch any other file, and do
not reformat or reorder anything you are not explicitly changing here.

Context: the masthead utility strip and the footer colophon are low-contrast on the
midnight ground (`--dark-ground` #17182E). The colophon is the worst case — it
inherits `--muted`, a light-ground token, which lands at about 2.3:1. Everything
below is a contrast/legibility fix; no layout or color-system changes beyond the one
new token.

Make these seven edits. Each `FIND` string currently appears exactly once; if any one
of them does not match, stop and report it rather than guessing at a nearby line.

---

## 1. New token

FIND
```css
  --dark-rule:       #3A3B55;
```
REPLACE
```css
  --dark-rule:       #3A3B55;
  --dark-utility:    #DCDAE8;   /* utility strip + colophon on midnight */
```

## 2. Utility strip type

FIND
```css
  color: var(--dark-muted);
  font-family: var(--mono);
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding-block: 7px;
```
REPLACE
```css
  color: var(--dark-utility);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding-block: 9px;
```

## 3. Live indicator + utility links

The saffron `--accent` (#E0552B) is only ~4.1:1 on midnight, which fails at this type
size. Use `--accent-light` in this strip only — leave `--accent` alone everywhere else.

FIND
```css
.utility-link { color: var(--dark-muted); text-decoration: none; }
.utility-link:hover { color: var(--accent); }
```
REPLACE
```css
.masthead__utility .live-indicator { color: var(--accent-light); }
.masthead__utility .live-dot { background: var(--accent-light); }

.utility-link { color: var(--dark-utility); text-decoration: none; }
.utility-link:hover { color: var(--accent-light); }
```

## 4. Utility strip, mobile step

FIND
```css
  .masthead__utility { padding-block: 6px; font-size: 9px; letter-spacing: .1em; }
```
REPLACE
```css
  .masthead__utility { padding-block: 8px; font-size: 11px; letter-spacing: .04em; }
```

## 5. Footer body size

Inside the `.footer` rule (the one that also sets `background: var(--dark-ground)`).

FIND
```css
  padding-block: var(--s7) var(--s8);
  font-size: 14px;
```
REPLACE
```css
  padding-block: var(--s7) var(--s8);
  font-size: 15px;
```

## 6. Footer colophon — the actual bug

FIND
```css
.footer .dateline { color: var(--muted); }
```
REPLACE
```css
/* Was on --muted, a light-ground token, at ~2.3:1 on midnight. */
.footer .dateline { color: var(--dark-utility); font-size: 13px; letter-spacing: 0.01em; }
.footer .dateline a { color: var(--dark-utility); text-decoration-color: var(--accent); }
.footer .dateline a:hover { color: var(--accent-light); }
```

## 7. Footer link list

Inside the `.footer__links a` rule.

FIND
```css
  font-size: 13.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--dark-ink);
```
REPLACE
```css
  font-size: 14.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--dark-ink);
```

---

## Then

1. `npm run build` (or `npm run dev`) and confirm it compiles.
2. Sanity-check that `--dark-utility` is referenced in four places and defined once.
3. Commit on a branch: `fix/dark-ground-contrast`, message
   `fix(css): raise contrast on utility strip and footer colophon`.

Do not change `EDITION 10:00 IST`, the fonts, or any markup in
`src/layouts/BaseLayout.astro` — the fix is CSS-only by design, so no template
touches are needed.
