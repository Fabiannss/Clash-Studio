import type { FighterCandidate } from '@/domain/types';
import { parseQuery, sameText } from './parseQuery';

// AniList: API pública, sem chave, com CORS liberado (roda direto no navegador).
const ENDPOINT = 'https://graphql.anilist.co';

const QUERY = `
query ($search: String) {
  Page(perPage: 8) {
    characters(search: $search) {
      id
      name { full }
      image { large }
      description(asHtml: false)
      siteUrl
      media(perPage: 1) { nodes { title { romaji english } } }
    }
  }
}`;

interface AniListCharacter {
  id: number;
  name: { full: string };
  image?: { large?: string };
  description?: string | null;
  siteUrl?: string;
  media?: { nodes: { title: { romaji?: string; english?: string } }[] };
}

function cleanDescription(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/~!.*?!~/gs, '') // remove spoilers
    .replace(/[_*~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

export async function searchAniList(rawQuery: string): Promise<FighterCandidate[]> {
  const { name, franchiseHint } = parseQuery(rawQuery);
  if (!name) return [];

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { search: name } }),
  });
  if (!response.ok) throw new Error(`AniList respondeu ${response.status}`);

  const json = (await response.json()) as { data?: { Page?: { characters?: AniListCharacter[] } } };
  const characters = json.data?.Page?.characters ?? [];

  const candidates = characters.map<FighterCandidate>((c) => {
    const title = c.media?.nodes[0]?.title;
    return {
      id: `anilist-${c.id}`,
      name: c.name.full,
      franchise: title?.english ?? title?.romaji ?? 'Franquia desconhecida',
      imageUrl: c.image?.large,
      description: cleanDescription(c.description),
      sourceUrl: c.siteUrl,
    };
  });

  // Se o usuário indicou a franquia, quem combina vem primeiro.
  if (franchiseHint) {
    candidates.sort(
      (a, b) => Number(sameText(b.franchise, franchiseHint)) - Number(sameText(a.franchise, franchiseHint)),
    );
  }
  return candidates;
}
