# Long Press - design layer

Drop-in over the existing scaffold. Every file here either replaces one you
already have or is new. Nothing in `src/content/`, `src/lib/`, `scripts/`,
`astro.config.mjs` or `vercel.json` changes.

## Apply

    cp -R ~/Downloads/longpress-design/. .
    npm run dev

New: `src/styles/global.css`, `src/components/AdSlot.astro`, `src/pages/about.astro`
Replaced: `BaseLayout.astro` and all seven page templates.

Then:

    npm run build
    git add -A && git commit -m "Long Press design system" && git push

## The design

**Own identity, not BuiltBySwami's.** The only thread back is the ink family.
No lavender, no mint, no Poppins - a title carries its own look.

- **Ground** white, with `#F6F6F3` for wells and ad slots
- **Ink** `#17171C` (cool near-black), muted `#6B6B76` (grey with a faint
  violet bias - chosen, not defaulted)
- **Accent** `#2A3FA8` deep indigo, used only for links, the wordmark mark and
  section rules
- **Type** Schibsted Grotesk (a face drawn for a news publisher) for headlines
  and UI; Source Serif 4 for body, because long-form on a phone reads better
  with a serif; system mono for labels and datelines - two webfonts, not three,
  because the audience is on Indian mobile networks

**Light, deliberately.** The dark-terminal register is right for BuiltBySwami
and for tools. It is wrong here: AdSense creatives are built against white and
look pasted-on over dark, viewability suffers, and a light ground reads better
on cheap screens in daylight.

**The terminal motif survives in one place.** The opinion slot in each brief
renders as a dark ink block with mono labelling - `.brief__item--opinion`,
applied automatically when an item's `kind` is `hot-take`, `myth-buster` or
`known-issue`. It is the only bold move on the page, which is what makes it
read as bold.

**The wordmark mark is a held key** - a rounded square with a soft ring,
drawn in CSS, no image. The gesture, not a logo.

**Numbers are real.** The brief renders each item's actual `slot` value rather
than a CSS counter, so the numbering survives an ad being inserted mid-list and
still means what it says.

**Rules, not cards.** Archives and hubs use hairline-separated rows. Border,
fill and radius are spent only where something genuinely is a separate object -
the ad slots and the opinion block.

## Ad slots

`<AdSlot placement="brief" | "article" | "hub" />` renders a labelled, correctly
sized empty box. Placements:

- brief - after item 3, mid-scroll
- article - after the body, before topic chips
- hub - homepage mid-page, and after row 8 or 6 in long lists

Reserved heights: 250px mobile everywhere; 90px desktop for brief and hub
leaderboards, 250px for the in-article rectangle. **Nothing shifts when the real
units land** - paste the AdSense `<ins>` inside `.ad__unit` and you are done.
Cumulative Layout Shift is a ranking factor, which is why these exist now rather
than later.

Every slot sits inside an `<li class="ad-row">` where it falls in a list, so the
markup stays valid.

## Still to do

- Favicon and OG image - both still Astro's defaults
- Pagination on `/daily` once the archive outgrows one page
- `public/ads.txt` still holds the placeholder line
