# Long Press — design playbook (internal reference)

Source of truth: the **Claude Design** project at
https://claude.ai/design/p/4e92ef58-c814-4f1c-9a78-b2acbe133145 — "Design
playbook", v2.0, 12 Sep 2026. That project is synced to this GitHub repo and
produces two things when re-run against it: this rules/token doc, and a
ranked review of drift since the last sync. This file is a static copy of
the rules half, kept in-repo so any future session — human or AI — can check
against it without reopening Claude Design.

**Not part of Long Press:** if you re-export from that project, the zip may
include a `_ds/organic-*/` folder. That is an unrelated bundled demo system
("Organic" — terracotta/sage, Caprasimo/Figtree), not this site. Ignore it.

## Five rules

1. **Rectangles are square.** Every corner is 0 (`--radius-*: 0`). The only
   round things are circles — icon buttons, the live dot, the ring mark. No
   pills, no rounded cards.
2. **Ink on accent is midnight.** Text on a saffron fill is `#0E0F1D` in both
   themes — never `var(--ink)` (flips in dark mode) and never `var(--ground)`
   (too light). One line, applies everywhere a fill is `var(--accent)`.
3. **Accent is a signal, not a surface.** One saffron element per view
   carries the meaning — the live dot, the active state, the one rule. If two
   compete for attention, one of them should be decoration instead.
4. **44px on a phone.** Anything tappable is 44×44 minimum below 768px.
   Desktop chrome may run smaller (36px is fine).
5. **One breakpoint for "phone."** 768px, everywhere — nav, masthead, drawer,
   search, type steps. A different number in any one of them means they
   disagree in the gap.

## Two grounds

Dark mode is a second set of values for the same seven roles, not an
inversion of the light ones.

### Sand · default

| Token | Value | Contrast |
|---|---|---|
| `--ground` | `#F4F1E8` | — |
| `--surface` | `#EAE5D6` | — |
| `--surface-card` | `#FFFFFF` | — |
| `--ink` | `#17182E` | 14.1:1 |
| `--ink-soft` | `#3B3A50` | 9.2:1 |
| `--muted` | `#6C6A7E` | 5.3:1 |
| `--accent` | `#E0552B` | 3.6:1 — headline-scale only |
| `--accent-deep` | `#A83D18` | 6.6:1 — paragraph-safe |
| `--accent-2` | `#3E7C74` | 4.6:1 |
| `--rule` | `#CFC9B8` | — |

### Midnight · `data-theme="dark"`

| Token | Value | Contrast |
|---|---|---|
| `--ground` | `#0E0F1D` | — |
| `--surface` | `#17182E` | — |
| `--surface-card` | `#1E1F36` | — |
| `--ink` | `#F5F3FB` | 17.4:1 |
| `--ink-soft` | `#D2CFE4` | 12.7:1 |
| `--muted` | `#9895AE` | 6.7:1 |
| `--accent` | `#F06236` | 5.4:1 |
| `--accent-deep` | `#FFA07E` | 8.9:1 — note the inversion: this is the *lighter* step here, but still the paragraph-safe one |
| `--accent-2` | `#4E9B91` | 6.1:1 |
| `--rule` | `#2C2D4A` | — |

Also declared: `--ground-subtle`, `--highlight`, `--shadow-card`,
`--shadow-pop` — one value per theme, referenced rather than hardcoded.

## Z-index — six layers, the whole set

| Layer | z-index |
|---|---|
| Mobile drawer + its backdrop | 999 / 998 |
| Reading progress bar | 940 |
| Back to top | 900 |
| Search dropdown | 120 |
| Sticky masthead | 50 |
| Archive pagination bar | 30 |

Anything new fits between these numbers or it doesn't need a z-index.

## Compliance checklist

Findings from the v2.0 review (12 Sep 2026), and status as of the last pass
through this repo:

| # | Finding | Status |
|---|---|---|
| 01 | Brand fonts not loading (Archivo/Public Sans/Space Grotesk vs Bricolage/Newsreader/Space Mono) | Fixed |
| 02 | Rounded chrome vs square house style; `.pill-tag` vs `.chip` | Fixed |
| 03 | Ink-on-accent contrast + 4 hardcoded colors (`#10B981`/`#065F46`, `#000`, `#FFA07E`, `#E0552B`) | Fixed |
| 04 | Masthead icon buttons under 44px on phone | Fixed |
| 05 | Two breakpoints for "phone" (640px vs 768px) | Fixed — unified at 768px |
| 06 | Dark mode implemented twice (ThemeToggle + MobileMenu) | Fixed — `src/lib/theme.ts` |
| 07 | No `--shadow-card`/`--shadow-pop`; dark cards have no elevation | Fixed |
| 08 | Reading progress bar `z-index: 9999`, above the drawer | Fixed — now 940 |
| 09 | Search highlight hardcoded, wrong in dark mode | Fixed — `--highlight` token (review suggested reusing `--accent-subtle`; a dedicated token was used instead, same outcome) |
| 10 | `.live-indicator` reverted to `var(--accent)` | Base rule still says `var(--accent)`, but the only real usage (`.masthead__utility .live-indicator`) is correctly overridden to `--accent-light` by a more specific selector. Not a visible bug; worth tidying the base rule someday. |

Optional/cosmetic, from the older v1.0 handoff notes, also checked:

| Item | Status |
|---|---|
| `og:image` + `og-default.png` | Already in place |
| `.ad-row` list-marker bug | Already fixed |
| Archive month grouping on `/daily` | Already done (built out further than the note suggested) |
| Known Issue empty state | Note is stale — the hub has real content now |
| About page "facts" strip | Added |
| Category-colored eyebrows on story pages | Added — news: ink, explainer: teal, tip: ink-soft, comparison: muted outline dot, known-issue: default saffron |

## Keeping this current

There's no automatic link between Claude Design and this repo — it's a
manual loop: point the project at the repo, it reads the diff, it hands back
ranked findings. After a meaningful round of UI work, re-run that review and
update the checklist above. Don't let this file drift from what `global.css`
actually does.
