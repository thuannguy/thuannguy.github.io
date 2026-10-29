import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'> & {
  date: Date;
  url: string;
  summary: string;
  readingMinutes: number;
};

const FILE_NAME = /^(\d{4})-(\d{1,2})-(\d{1,2})-(.+)$/;
const pad = (n: string) => n.padStart(2, '0');

/** Builds the same URL Jekyll used: /blog/:year/:month/:day/:title/ */
function parseId(id: string) {
  const match = FILE_NAME.exec(id);
  if (!match) throw new Error(`Post file name must start with a date: ${id}`);
  const [, year, month, day, slug] = match;
  return {
    date: new Date(Date.UTC(+year, +month - 1, +day)),
    params: { year, month: pad(month), day: pad(day), slug },
  };
}

/** Plain-text first paragraph of a Markdown body. */
function firstParagraph(body = '') {
  const paragraph = body
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(#|!\[|<|```|\||>|-|\*|\d+\.)/.test(p));
  return (paragraph ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateWords(text: string, count: number) {
  const words = text.split(' ');
  return words.length > count ? `${words.slice(0, count).join(' ')}...` : text;
}

export function postParams(post: CollectionEntry<'blog'>) {
  return parseId(post.id).params;
}

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('blog', ({ data }) => data.published !== false);
  return entries
    .map((entry) => {
      const { date, params } = parseId(entry.id);
      const description = entry.data.description?.trim();
      const summary =
        description && description !== entry.data.title && description !== 'Template'
          ? description
          : firstParagraph(entry.body);
      const words = (entry.body ?? '').split(/\s+/).filter(Boolean).length;
      return {
        ...entry,
        date,
        url: `/blog/${params.year}/${params.month}/${params.day}/${params.slug}/`,
        summary: truncateWords(summary, 28),
        readingMinutes: Math.max(1, Math.round(words / 200)),
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime() || b.id.localeCompare(a.id));
}

export const formatDate = (date: Date, month: 'short' | 'long' = 'short') =>
  date.toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric', timeZone: 'UTC' });
