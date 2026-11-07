import type { FighterCandidate } from '@/domain/types';
import { searchAniList } from './anilistSearch';
import { searchWikipedia } from './wikipediaSearch';

/**
 * Junta AniList (mangá/anime) e Wikipedia (quadrinhos). Se uma fonte falhar,
 * a outra ainda responde; só falha se as duas falharem.
 */
export async function searchFighters(query: string): Promise<FighterCandidate[]> {
  const [anilist, wiki] = await Promise.allSettled([searchAniList(query), searchWikipedia(query)]);

  if (anilist.status === 'rejected' && wiki.status === 'rejected') {
    throw new Error('Não foi possível consultar AniList nem Wikipedia. Verifique sua conexão.');
  }
  const a = anilist.status === 'fulfilled' ? anilist.value : [];
  const w = wiki.status === 'fulfilled' ? wiki.value : [];
  return [...a, ...w];
}
