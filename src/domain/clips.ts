import { BEATS_PER_TAKE, BEAT_SECONDS, CROSSFADE_SECONDS, TAKE_COUNT } from './constants';
import type { ClipKey, TakeIndex } from './types';

export const clipId = (key: ClipKey): string => `${key.take}-${key.beat}`;

export function allClipKeys(): ClipKey[] {
  const keys: ClipKey[] = [];
  for (let take = 1; take <= TAKE_COUNT; take++) {
    for (let beat = 1; beat <= BEATS_PER_TAKE; beat++) {
      keys.push({ take: take as TakeIndex, beat });
    }
  }
  return keys;
}

/**
 * Duração aproveitada de um sub-clipe. O último sub-clipe dos takes 1 e 2 ganha
 * o tempo do crossfade, para o vídeo final fechar em exatamente 60s.
 */
export function clipSeconds(key: ClipKey): number {
  const base = BEAT_SECONDS[key.beat - 1];
  const overlapsNextTake = key.beat === BEATS_PER_TAKE && key.take < TAKE_COUNT;
  return overlapsNextTake ? base + CROSSFADE_SECONDS : base;
}

export function takeSeconds(take: TakeIndex): number {
  return BEAT_SECONDS.reduce((sum, _s, i) => sum + clipSeconds({ take, beat: i + 1 }), 0);
}
