/**
 * Which topic hubs are indexable. Dependency-free, so the page templates and
 * astro.config.mjs (which cannot call getCollection) read the same numbers.
 *
 * A topic hub with one or two stories is a thin page: Google crawls it and
 * declines to index it ("Crawled - currently not indexed"). Below the
 * threshold the hub still renders and still passes links (noindex, follow),
 * but it is kept out of the sitemap and nothing on the site links to it.
 * Cross the threshold and it flips to indexable on the next build.
 */
import fs from 'node:fs';
import path from 'node:path';

export const TOPIC_MIN_STORIES = 5;

const STORIES_DIR = 'src/content/stories';

/** Inline array only: topics: ["a", "b"]. Same flat-frontmatter assumption as lastmod.mjs. */
function parseTopics(raw) {
  const block = raw.split('---')[1] ?? '';
  if (/^draft:\s*true\s*$/m.test(block)) return null;
  const m = block.match(/^topics:\s*\[(.*)\]\s*$/m);
  if (!m) return [];
  return m[1]
    .split(',')
    .map((t) => t.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

/** @returns {Map<string, number>} topic -> number of published stories */
export function topicCounts(root = process.cwd()) {
  const dir = path.join(root, STORIES_DIR);
  const counts = new Map();
  if (!fs.existsSync(dir)) return counts;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const topics = parseTopics(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (!topics) continue;
    for (const t of new Set(topics)) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return counts;
}

export function isIndexableTopic(topic, counts = topicCounts()) {
  return (counts.get(topic) ?? 0) >= TOPIC_MIN_STORIES;
}

/** Sitemap filter: false for /topics/<x> pages that are below the threshold. */
export function topicSitemapFilter(root = process.cwd()) {
  const counts = topicCounts(root);
  return (pageUrl) => {
    const m = new URL(pageUrl).pathname.match(/^\/topics\/([^/]+)\/?$/);
    return m ? isIndexableTopic(decodeURIComponent(m[1]), counts) : true;
  };
}
