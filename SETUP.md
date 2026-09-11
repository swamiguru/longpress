# Long Press - Astro scaffold

These files encode the routing spec. The framework boilerplate is not included
on purpose: generate it with Astro's own tool so versions resolve to whatever is
current, then drop these in on top.

## 1. Generate the base

    npm create astro@latest longpress -- --template minimal --typescript strict
    cd longpress
    npx astro add react sitemap
    npm i @astrojs/rss

## 2. Copy these files in

Overwrite `astro.config.mjs`. Everything else is new.

    astro.config.mjs
    src/content.config.ts
    src/lib/routing/slugs.mjs
    src/lib/routing/check.mjs
    src/layouts/BaseLayout.astro
    src/pages/index.astro
    src/pages/[slug].astro
    src/pages/rss.xml.js
    src/pages/daily/index.astro
    src/pages/daily/[date].astro
    src/pages/daily/[year]/index.astro
    src/pages/daily/[year]/[month]/index.astro
    src/pages/known-issue/index.astro
    src/pages/topics/[topic].astro
    src/content/daily/2026-09-11.md
    src/content/stories/what-a-cms-migration-actually-costs.md
    scripts/check-routes.mjs
    public/robots.txt
    public/ads.txt

## 3. Wire the routing gate into the build

In `package.json`:

    "scripts": {
      "prebuild": "node scripts/check-routes.mjs",
      "build": "astro build"
    }

It **blocks** on an invalid or duplicate slug - a colliding slug is a broken
URL, not a style nit. It also prints the Known Issue rolling rate and warns
(without blocking) when the latest brief has no Hot Take or Myth-Buster, which
mirrors the slot-5 linter you already run on builtbyswami.

## 4. Deploy

Link the repo to the existing `longpress` Vercel project
(prj_L8Mz7B2Or7dnkwEuNNvGLvITz3lz) on the **swami-guru paid team**. Astro is
auto-detected. `longpress.news` is already assigned.

Do not add the `/tech-roundup` redirects to the builtbyswami project until every
existing issue renders here. Never point a 301 at a 404.

---

## What is deliberate in here

**`data.slug`, not the filename.** `src/pages/[slug].astro` builds paths from the
explicit frontmatter `slug` field. `slugify()` in `slugs.mjs` is an editor
suggestion only - it strips non-Latin, so a Devanagari headline would collapse
to hyphens. Storing the slug also means a headline can be rewritten freely
without the URL moving.

**The one-place rule is schema-enforced.** In `content.config.ts` each brief item
must carry EITHER `body` (full text stays in the brief) OR `story` (promoted to
its own page, brief shows a teaser and links). Zod rejects both and neither, so
you cannot accidentally publish the same text twice and self-compete. That is
also why no canonical tags appear anywhere in the layout - they are not needed.

**Category is metadata, never a URL segment.** `/known-issue` and
`/topics/<topic>` filter on frontmatter. Recategorising a piece costs no
redirect.

**`build.format: 'file'` plus `trailingSlash: 'never'`** gives one canonical URL
shape with no trailing-slash duplicates.

## Astro version note

`src/content.config.ts` uses the Astro 5+ content layer (`glob()` loader from
`astro/loaders`). If `npm create` lands you on v4, the file moves to
`src/content/config.ts` and collections use `type: 'content'` with no loader -
the schemas themselves carry over unchanged.

## Still to build

- `/about` - masthead, cadence statement, publisher credit
- Pagination on `/daily` once the archive outgrows one page
- The content pipeline cutover: the daily runner needs to write into
  `src/content/daily/YYYY-MM-DD.md` in the shape above. Do this as a separate
  step, after the site is stable - it is the piece that already failed silently
  once.
