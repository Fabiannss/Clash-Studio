import { BEATS_PER_TAKE, OUTPUT } from '@/domain/constants';
import { clipId } from '@/domain/clips';
import { defaultFocus, type FocusChoice, type FxSettings } from '@/domain/fx';
import type { ClipFxPlan } from './fxFilters';

/** Cria a função que monta o plano de efeitos de cada clipe a partir das opções do usuário. */
export function makeFxPlanner(settings: FxSettings, focus: Record<string, FocusChoice>) {
  return (take: number, beat: number, seconds: number): ClipFxPlan => ({
    settings,
    focus: focus[clipId({ take: take as 1 | 2 | 3, beat })] ?? defaultFocus(take, beat, BEATS_PER_TAKE),
    seconds,
    width: OUTPUT.width,
    height: OUTPUT.height,
  });
}

/** Texto que muda sempre que um efeito ou foco muda: serve para saber se a prévia ficou velha. */
export function fxSignature(settings: FxSettings, focus: Record<string, FocusChoice>): string {
  return JSON.stringify([settings, Object.entries(focus).sort(([a], [b]) => a.localeCompare(b))]);
}
