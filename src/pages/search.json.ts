import { getCollection } from 'astro:content';

export async function GET() {
  const stories = await getCollection('stories', ({ data }) => !data.draft);
  const briefs = await getCollection('daily', ({ data }) => !data.draft);
  const finePrint = await getCollection('finePrint', ({ data }) => !data.draft);

  const dtf = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });

  const storyItems = stories.map((s) => ({
    type: 'story' as const,
    id: s.data.slug,
    title: s.data.title,
    description: s.data.description,
    category: s.data.category,
    topics: s.data.topics || [],
    date: dtf.format(s.data.published),
    url: `/${s.data.slug}`,
  }));

  // Fine Print explainers ride in the stories list (category 'explainer')
  // so the existing search UI finds them without changes.
  for (const f of finePrint) {
    storyItems.push({
      type: 'story' as const,
      id: `fine-print-${f.data.slug}`,
      title: f.data.title,
      description: f.data.description,
      category: 'explainer',
      topics: f.data.topics || [],
      date: dtf.format(f.data.published),
      url: `/fine-print/${f.data.slug}`,
    });
  }

  const briefItems = briefs.map((b) => {
    const slug = b.id.replace(/\.md$/, '');
    const headlines = b.data.items.map((i) => i.heading).join(' · ');
    const tags = Array.from(new Set(b.data.items.map((i) => i.kind)));
    return {
      type: 'brief' as const,
      id: slug,
      title: b.data.title,
      description: b.data.description,
      headlines,
      topics: tags,
      date: dtf.format(b.data.date),
      url: `/daily/${slug}`,
    };
  });

  const topicCounts: Record<string, number> = {};
  for (const s of stories) {
    for (const t of s.data.topics || []) {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    }
  }

  const allTopics = Object.entries(topicCounts).map(([tag, count]) => ({
    tag,
    count,
    url: `/topics/${tag}`,
  }));

  const payload = {
    stories: storyItems,
    briefs: briefItems,
    topics: allTopics,
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
