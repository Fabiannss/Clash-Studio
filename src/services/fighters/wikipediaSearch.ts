import type { FighterCandidate } from '@/domain/types';
import { parseQuery } from './parseQuery';

// Wikipedia cobre quadrinhos ocidentais (Marvel, DC) que o AniList não tem.
// API pública, sem chave; "origin=*" libera CORS.

const SEARCH = 'https://en.wikipedia.org/w/api.php';
const SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

interface SummaryResponse {
  title: string;
  extract?: string;
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page?: string } };
}

export async function searchWikipedia(rawQuery: string): Promise<FighterCandidate[]> {
  const { name, franchiseHint } = parseQuery(rawQuery);
  if (!name) return [];

  const term = franchiseHint ? `${name} ${franchiseHint} character` : `${name} character`;
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: term,
    srlimit: '4',
    format: 'json',
    origin: '*',
  });
  const found = await fetch(`${SEARCH}?${params}`);
  if (!found.ok) throw new Error(`Wikipedia respondeu ${found.status}`);
  const data = (await found.json()) as { query?: { search?: { title: string }[] } };
  const titles = data.query?.search?.map((s) => s.title) ?? [];

  const summaries = await Promise.all(
    titles.map(async (title) => {
      const res = await fetch(SUMMARY + encodeURIComponent(title.replace(/ /g, '_')));
      return res.ok ? ((await res.json()) as SummaryResponse) : null;
    }),
  );

  return summaries
    .filter((s): s is SummaryResponse => s !== null && Boolean(s.extract))
    .map<FighterCandidate>((s) => ({
      id: `wiki-${s.title}`,
      name: s.title,
      franchise: franchiseHint || 'Wikipedia',
      imageUrl: s.thumbnail?.source,
      description: (s.extract ?? '').slice(0, 500),
      sourceUrl: s.content_urls?.desktop?.page,
    }));
}
