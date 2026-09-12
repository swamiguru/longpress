/**
 * Utility to calculate and format estimated reading time for articles
 * based on word count.
 */

export interface ReadingTimeResult {
  /** Estimated word count */
  words: number;
  /** Estimated reading time in minutes (minimum 1) */
  minutes: number;
  /** Formatted human-readable string (e.g., "3 min read") */
  text: string;
}

/** Standard average adult reading speed for journalistic/editorial web content */
export const DEFAULT_WORDS_PER_MINUTE = 200;

/**
 * Strips HTML tags, Markdown markers, and excessive punctuation,
 * then returns the total word count.
 */
export function countWords(input: string): number {
  if (!input || typeof input !== 'string') return 0;

  let text = input;

  // Remove code blocks and inline code
  text = text.replace(/```[\s\S]*?```/g, ' ');
  text = text.replace(/`[^`]*`/g, ' ');

  // Convert markdown links [label](url) to just the label
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Strip markdown images ![alt](url)
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ');

  // Strip HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Strip frontmatter delimiters if any remain
  text = text.replace(/^---[\s\S]*?---/g, ' ');

  // Strip markdown headings, quotes, list markers
  text = text.replace(/^[#>*+\-\d\.]+\s+/gm, ' ');

  // Strip formatting symbols (bold, italic, strike)
  text = text.replace(/[*_~#]/g, ' ');

  // Split on whitespace and filter empty tokens
  const tokens = text.trim().split(/\s+/).filter((w) => w.length > 0);
  return tokens.length;
}

/**
 * Calculates estimated reading time for a given text or markdown string.
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = DEFAULT_WORDS_PER_MINUTE
): ReadingTimeResult {
  const words = countWords(content);
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return {
    words,
    minutes,
    text: `${minutes} min read`,
  };
}

/**
 * Calculates estimated reading time for an article (Story collection entry,
 * Daily Brief collection entry, or a plain text string).
 */
export function getArticleReadingTime(
  article: any,
  wordsPerMinute: number = DEFAULT_WORDS_PER_MINUTE
): ReadingTimeResult {
  if (!article) {
    return { words: 0, minutes: 1, text: '1 min read' };
  }

  if (typeof article === 'string') {
    return calculateReadingTime(article, wordsPerMinute);
  }

  const parts: string[] = [];

  if (article.body && typeof article.body === 'string') {
    parts.push(article.body);
  }

  if (article.data) {
    if (article.data.title) parts.push(article.data.title);
    if (article.data.description) parts.push(article.data.description);
    if (article.data.intro) parts.push(article.data.intro);

    if (Array.isArray(article.data.items)) {
      for (const item of article.data.items) {
        if (item.heading) parts.push(item.heading);
        if (item.body) parts.push(item.body);
        if (item.teaser) parts.push(item.teaser);
        if (item.problem) parts.push(item.problem);
        if (item.breakthrough) parts.push(item.breakthrough);
        if (item.catch) parts.push(item.catch);
        if (item.forYou) parts.push(item.forYou);
      }
    }
  }

  return calculateReadingTime(parts.join(' '), wordsPerMinute);
}
