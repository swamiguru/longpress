# Task: Fix Now + theme consistency patch

Six fixes from the 12 Sep design review. They are independent — do them in order, build
between each, and commit each as its own commit on one branch `fix/design-review-sept`.

Files touched:
`src/layouts/BaseLayout.astro`, `src/styles/global.css`, `src/pages/search.astro`,
`src/components/{ThemeToggle,HeaderSearch,MobileMenu,ShareButtons}.astro`,
`public/images/**/*.svg`, and one new file `src/lib/theme.ts`.

Where a `FIND` string is given it currently appears exactly once. If one does not match,
**stop and report it** rather than editing a nearby line.

---

## 1. Load the brand fonts

The tokens ask for Archivo / Public Sans / Space Grotesk. The head requests three faces
nothing references, and there is no `@font-face` anywhere, so the whole site renders in
`system-ui`.

### 1a. `src/layouts/BaseLayout.astro`

FIND
```
      href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,600&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
```
REPLACE
```
      href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@112,600;112,700;125,700;125,800;100,400;100,500&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;700&display=swap"
```

Archivo must be requested on the `wdth` axis or `font-variation-settings: 'wdth' 125`
silently does nothing — that expanded headline width is the masthead's signature.

### 1b. Add a preconnect

Directly above that `<link rel="stylesheet" ...>` element, add:
```html
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

### 1c. The three article SVGs

In `public/images/daily/windows-god-mode.svg`,
`public/images/stories/iphone-18-pro-schematic.svg` and any sibling SVG that does the
same, replace every occurrence of
```
font-family="'Bricolage Grotesque', sans-serif"
```
with
```
font-family="'Archivo', system-ui, sans-serif"
```
(one file has it 4 times). Leave every other attribute alone. If the `.webp` derivatives
were rasterised from these SVGs, re-run `scripts/optimize-images.mjs` afterwards so the
raster versions match.

### Verify
Load any page and confirm in devtools that a heading computes to `Archivo`, body copy to
`Public Sans`, and an eyebrow to `Space Grotesk`.

---

## 2. Square the corners

`global.css` states square corners as the house style and pins `--radius-sm/md/lg` to `0`.
Everything shipped since carries 8–22px radii and `9999px` pills, so the editorial system
and the new chrome now disagree on every page.

**The rule: rectangles are square; only round things are round.**

Apply it across `src/styles/global.css` AND the `<style>` block of every component in
`src/components/` and every page-level `<style>` in `src/pages/` (notably
`src/pages/search.astro`):

1. **Delete** every `border-radius` declaration whose value is a length — `4px`, `6px`,
   `8px`, `10px`, `12px`, `14px`, `15px 15px 0 0`, `16px`, `18px`, `20px`, `22px`, and so
   on. Delete the whole declaration; do not set it to `0` (the elements are square by
   default and the file stays shorter). This includes the ones inside the `@media` blocks
   at the bottom of `global.css`, which restate radii for mobile.
2. **Keep** every `border-radius: 50%` exactly as it is — live dots, status dots, avatars.
3. **Convert** `border-radius: 9999px` to `border-radius: 50%` **only** where the element
   is a circular icon button — it has an equal fixed `width` and `height` (36px, 38px,
   44px) and contains just an icon. In practice that is `.theme-toggle`,
   `.header-search-trigger`, `.mobile-menu-toggle`, `.mobile-drawer-close`, and
   `.header-search__clear`. Everywhere else `9999px` is a pill on a text element —
   **delete** it per rule 1.

Do not change padding, borders, backgrounds, sizes or shadows in this pass. Radius only.

### Then retire the duplicate label component

There are two components doing one job: `.chip` (square) and `.pill-tag` (was a pill).
After the sweep they render almost identically, so collapse them:

- Keep `.chip` and its modifiers as the label component.
- Leave the `.pill-tag` rules in place for now but add above them:
  ```css
  /* Deprecated: use .chip. Kept only so existing markup does not break.
     Do not add new .pill-tag usages. */
  ```
- Do not rewrite the markup in this commit.

### Verify
`grep -n "border-radius" src/styles/global.css src/components/*.astro src/pages/*.astro`
should return only `50%` values. Then look at the search page, a story page and the mobile
drawer: every card, input, tab and tag square, every icon button still a circle.

---

## 3. Contrast and four colours that don't follow the theme

### 3a. Ink on accent is always midnight

Two fills pair two tokens that both flip, so one of them fails.

`src/styles/global.css` —

FIND
```
  color: var(--ink); background: var(--accent);
```
REPLACE
```
  /* #0E0F1D, not var(--ink): ink flips to near-white in dark mode and
     white-on-saffron is 2.6:1. This reads 6.4:1 light / 7.0:1 dark. */
  color: #0E0F1D; background: var(--accent);
```

`src/pages/search.astro` —

FIND
```
  .topic-filter-btn.is-active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--ground);
  }
```
REPLACE
```
  .topic-filter-btn.is-active {
    background: var(--accent);
    border-color: var(--accent);
    color: #0E0F1D;
  }
```

`.filter-tab.is-active` already pairs `--ink` with `--ground` and inverts correctly —
leave it.

### 3b. The live indicator in the utility strip

`src/styles/global.css` — the edition time is `--accent` on the midnight strip, 4.1:1 at
10.5px bold.

FIND
```
.live-indicator { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--accent); }
```
REPLACE
```
.live-indicator { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--accent); }
/* The utility strip is always on the midnight ground, in both themes,
   so the accent needs its light step there. */
.masthead__utility .live-indicator { color: var(--accent-light); }
.masthead__utility .live-dot { background: var(--accent-light); }
```

### 3c. Two missing tokens

`src/styles/global.css`, in `:root` —

FIND
```
  --dark-utility:    #DCDAE8;   /* utility strip + colophon on midnight */
```
REPLACE
```
  --dark-utility:    #DCDAE8;   /* utility strip + colophon on midnight */
  --ground-subtle:   #EFEAE0;   /* drawer telemetry strip, faint wash    */
  --highlight:       rgba(224, 85, 43, 0.22);  /* search match           */
```

And in `html[data-theme="dark"]` —

FIND
```
  --dark-rule:       #262740;
  --dark-utility:    #DCDAE8;
}
```
REPLACE
```
  --dark-rule:       #262740;
  --dark-utility:    #DCDAE8;
  --ground-subtle:   #131426;
  --highlight:       rgba(240, 98, 54, 0.32);
}
```

`--ground-subtle` is already read by `MobileMenu.astro`'s telemetry strip through a
fallback; once declared, simplify that usage:

`src/components/MobileMenu.astro` —

FIND
```
    background: var(--ground-subtle, rgba(0, 0, 0, 0.02));
    border-bottom: 1px solid var(--rule-soft, var(--rule));
```
REPLACE
```
    background: var(--ground-subtle);
    border-bottom: 1px solid var(--rule-soft);
```

### 3d. The search highlight

`src/components/HeaderSearch.astro` —

FIND
```
  :global(.search-item mark),
  :global(.search-tag-pill mark) {
    background: rgba(224, 85, 43, 0.22);
```
REPLACE
```
  :global(.search-item mark),
  :global(.search-tag-pill mark) {
    background: var(--highlight);
```

### 3e. The share bar's off-palette green and black

`src/components/ShareButtons.astro`. The copy-confirmation green (`#10B981` /
`#065F46`) is a colour the brand never declared; teal is already the second voice. And
`#000` on the X hover is black on near-black in dark mode.

Replace **every** occurrence in that file's `<style>` block:

| Find | Replace |
| --- | --- |
| `color: #10B981;` | `color: var(--accent-2);` |
| `background: rgba(16, 185, 129, 0.1);` | `background: var(--accent-2-subtle);` |
| `border-color: rgba(16, 185, 129, 0.4);` | `border-color: var(--accent-2);` |
| `color: #065F46;` | `color: var(--accent-2);` |

(The green appears in two near-identical blocks, `.share-pill--webshare.is-copied` and
`.share-pill--copy.is-copied`, plus two `.share-pill__icon--check` rules — do all of them.)

Then —

FIND
```
  .share-pill--twitter:hover {
    border-color: #000;
    color: #000;
  }
```
REPLACE
```
  .share-pill--twitter:hover {
    border-color: var(--ink);
    color: var(--ink);
  }
```

`.share-pill--linkedin:hover` keeps `#0A66C2` — that is LinkedIn's own brand blue on a
hover border only, and it holds up on both grounds.

### 3f. The remaining hard-coded accents

`src/components/ThemeToggle.astro` —

FIND
```
  :global(html[data-theme="dark"]) .theme-toggle__icon--sun {
    transform: rotate(0deg) scale(1);
    opacity: 1;
    color: #FFA07E;
  }
```
REPLACE
```
  :global(html[data-theme="dark"]) .theme-toggle__icon--sun {
    transform: rotate(0deg) scale(1);
    opacity: 1;
    color: var(--accent-deep);
  }
```

`src/components/MobileMenu.astro` — two edits.

FIND
```
  :global(html[data-theme="dark"]) .drawer-theme-svg--sun { display: block; color: #FFA07E; }
```
REPLACE
```
  :global(html[data-theme="dark"]) .drawer-theme-svg--sun { display: block; color: var(--accent-deep); }
```

FIND
```
            <path d="M21 1.5a19.5 19.5 0 0 1 13.8 33.3" fill="none" stroke="#E0552B" stroke-width="4.5" stroke-linecap="round" />
```
REPLACE
```
            <path d="M21 1.5a19.5 19.5 0 0 1 13.8 33.3" fill="none" stroke="var(--accent)" stroke-width="4.5" stroke-linecap="round" />
```

FIND
```
  .drawer-card__badge--opinion {
    background: rgba(14, 15, 29, 0.06);
```
REPLACE
```
  .drawer-card__badge--opinion {
    background: var(--surface-hover);
```

`src/styles/global.css` — two leftovers from the previous system.

FIND
```
  background: rgba(42, 63, 168, 0.08);
  padding: 3px 8px;
```
REPLACE
```
  background: var(--accent-subtle);
  padding: 3px 8px;
```

FIND
```
  border: 1px solid rgba(42, 63, 168, 0.2);
```
REPLACE
```
  border: 1px solid var(--accent-border);
```

And the status dot on the about page —

FIND
```
  background: #10B981;
```
REPLACE
```
  background: var(--accent-2);
```

---

## 4. 44px tap targets on phones

The search trigger and theme toggle are 36px and the hamburger 38px, sitting side by side
in the masthead. Keep them light on desktop; raise all three below 768px, where the input
device is a thumb.

Add to the **end** of the `<style>` block in `src/components/ThemeToggle.astro`:
```css
  @media (max-width: 768px) {
    .theme-toggle {
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
    }
  }
```

Add to the **end** of the `<style>` block in `src/components/HeaderSearch.astro`
(after the existing `@media (max-width: 768px)` block, as a second one is fine, or fold
these four lines into it):
```css
  @media (max-width: 768px) {
    .header-search-trigger {
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
    }
  }
```

In `src/components/MobileMenu.astro`, the trigger already has a mobile query —

FIND
```
  @media (max-width: 768px) {
    .mobile-menu-toggle {
      display: inline-flex;
    }
  }
```
REPLACE
```
  @media (max-width: 768px) {
    .mobile-menu-toggle {
      display: inline-flex;
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
    }
  }
```

### Verify
In a 390px viewport, all three masthead buttons measure 44×44 and the row still fits
beside the wordmark without wrapping. If it is tight, reduce `.masthead__tools` `gap` to
`4px` in the mobile block rather than shrinking the buttons.

---

## 5. One breakpoint for "this is a phone"

The nav consolidates into the drawer at `max-width: 768px`, but the masthead's own compact
layout doesn't start until `640px`. Between 641 and 768 you get a hamburger on a
full-size desktop masthead — every portrait tablet.

Fix by **moving** the masthead rules up to 768, not by changing the 640 query (which also
carries type steps that should stay at 640).

In `src/styles/global.css`:

1. In the `@media (max-width: 640px)` block that begins with `body { font-size: 16px; }`,
   **cut** the contiguous run of rules that starts at the comment
   ```
   /* --- Masthead: compact, sticky, nav as a scrolling rail ---- */
   ```
   and ends with the closing brace of the `.nav { display: none !important; }` rule that
   follows `.brand-logo__mark svg`. That run covers `.masthead`, `.masthead__utility`,
   `.masthead__utility-inner`, `.masthead__main`, `.masthead__inner`,
   `.masthead__branding`, `.masthead__actions`, `.masthead__tools`,
   `.brand-logo__tagline`, `.brand-logo__title`, `.brand-logo__mark svg` and `.nav`. Stop
   before the `/* --- Lead --- */` comment.
2. **Paste** it into the existing `@media (max-width: 768px)` block headed
   `/* --- Mobile Navigation Consolidation (< 768px) -------------- */` near line 404.
3. That target block already contains `.nav { display: none !important; }` and
   `.masthead__tools` rules — merge rather than duplicate: keep one declaration of each
   property, preferring the values from the 640 block you just moved.

### Verify
Resize through 640 / 700 / 767 / 769. The masthead should compact and go sticky at the
same width the nav collapses (768), with no width where a hamburger sits on a tall
masthead. Type steps still change at 640 — that is intended.

---

## 6. One theme module instead of two implementations

`ThemeToggle.astro` and `MobileMenu.astro` each carry their own copy of the same
twenty lines writing `data-theme`, `localStorage` and the `theme-color` meta tag, then
resynchronise through a custom event.

### 6a. New file `src/lib/theme.ts`

```ts
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'longpress-theme';
const META_COLOR: Record<Theme, string> = {
  light: '#F4F1E8',
  dark: '#0E0F1D',
};

export function getTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode — the theme still applies for this page */
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', META_COLOR[theme]);

  window.dispatchEvent(new CustomEvent('longpress:theme-change', { detail: { theme } }));
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

/** Fires whenever the theme changes, from any control on the page. */
export function onThemeChange(handler: (theme: Theme) => void): void {
  window.addEventListener('longpress:theme-change', () => handler(getTheme()));
}
```

### 6b. `src/components/ThemeToggle.astro`

Replace the entire `<script is:inline> … </script>` block at the end of the file with a
bundled module script (drop `is:inline` so Astro can resolve the import):

```astro
<script>
  import { getTheme, toggleTheme, onThemeChange } from '../lib/theme';

  function setup() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    function updateLabel() {
      const label = getTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('title', label);
    }

    updateLabel();
    onThemeChange(updateLabel);
    toggle.addEventListener('click', () => toggleTheme());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
</script>
```

### 6c. `src/components/MobileMenu.astro`

Same treatment: drop `is:inline` from its script tag and add
```js
  import { getTheme, toggleTheme, onThemeChange } from '../lib/theme';
```
as the first line inside it. Then, inside `setupMobileNavDrawer`:

- Replace the body of `updateThemeLabel` so it reads the theme from `getTheme()`:
  ```js
      function updateThemeLabel() {
        if (!themeStatus || !themeBtnLabel) return;
        const isDark = getTheme() === 'dark';
        themeStatus.textContent = isDark ? 'Deep Midnight Dark' : 'Sand Editorial Light';
        themeBtnLabel.textContent = isDark ? 'To Light' : 'To Dark';
      }
  ```
- Replace the whole `themeToggleBtn.addEventListener('click', …)` handler — all of its
  `setAttribute` / `localStorage` / meta / `dispatchEvent` lines — with:
  ```js
      if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => toggleTheme());
      }
  ```
- Replace `window.addEventListener('longpress:theme-change', updateThemeLabel);` with
  `onThemeChange(updateThemeLabel);`

### 6d. Leave the boot script alone

The anti-FOUC script in `BaseLayout.astro`'s `<head>` must stay `is:inline` and
dependency-free — it has to run before first paint, ahead of any module. It keeps its own
copy of the two meta colours by necessity. Add a comment above it so nobody
"deduplicates" it later:

FIND
```
    <!-- Anti-FOUC Theme Detection Script -->
```
REPLACE
```
    <!-- Anti-FOUC theme detection. Deliberately inline and dependency-free:
         it must run before first paint, so it cannot import src/lib/theme.ts.
         The two colours below are duplicated there on purpose — keep in step. -->
```

### Verify
Toggle from the header on desktop, then from the drawer card on mobile, then reload —
the choice persists, the drawer label and the header icon agree, and the browser chrome
colour follows. `grep -rn "longpress-theme" src/` should show exactly two hits: the boot
script and `src/lib/theme.ts`.

---

## Finally

1. `npm run build` — must compile clean.
2. Walk `/`, `/search`, `/daily`, `/known-issue`, `/about` and one story page, in both
   themes, at 390px and 1280px.
3. Commit as six commits on `fix/design-review-sept`:
   - `fix(type): load Archivo, Public Sans and Space Grotesk`
   - `refactor(css): square every corner except icon buttons`
   - `fix(a11y): ink-on-accent contrast and four unthemed colours`
   - `fix(a11y): 44px tap targets for masthead tools on mobile`
   - `fix(css): unify the phone breakpoint at 768px`
   - `refactor(theme): single theme module for both toggles`

Not in this patch, and still open from the review: the reading progress bar's
`z-index: 9999` sitting above the mobile drawer, and per-theme `--shadow-card` /
`--shadow-pop` tokens so dark mode has elevation.
