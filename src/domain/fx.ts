import type { FighterSlot } from './types';

/** Efeitos de edição aplicados em cada clipe na hora da montagem. */
export interface FxSettings {
  /** Cor do lutador em foco nas luzes e sombras do clipe. */
  tint: boolean;
  /** Clarão e tremor de câmera no momento do impacto. */
  impact: boolean;
  /** Câmera lenta no impacto seguida de aceleração. */
  slowmo: boolean;
  /** Vinheta, contraste e grão de cinema. */
  cinema: boolean;
}

export const DEFAULT_FX: FxSettings = { tint: true, impact: true, slowmo: true, cinema: true };

/** Quem é o foco do clipe: define a cor do efeito. "both" mistura as duas cores. */
export type FocusChoice = FighterSlot | 'both';

export const FIGHTER_COLORS: Record<FighterSlot, string> = { A: '#FF7A59', B: '#3FC1D9' };

/** Momento do impacto dentro do clipe, em fração da duração (o app não detecta o golpe). */
export const IMPACT_AT = 0.6;

export const FX_OPTIONS: { id: keyof FxSettings; label: string; hint: string }[] = [
  { id: 'tint', label: 'Cor do lutador em foco', hint: 'Tinge a imagem com a cor do lutador em foco no clipe. Com "Os dois", fica sem cor.' },
  { id: 'impact', label: 'Clarão e tremor no impacto', hint: 'Flash branco curto e tremor de câmera a 60% do clipe.' },
  { id: 'slowmo', label: 'Câmera lenta e aceleração', hint: 'Desacelera no impacto e acelera logo depois, como em jogo de ação.' },
  { id: 'cinema', label: 'Vinheta e grão de cinema', hint: 'Escurece as bordas, reforça o contraste e unifica clipes de visuais diferentes.' },
];

export const FOCUS_OPTIONS: { id: FocusChoice; label: string }[] = [
  { id: 'both', label: 'Os dois' },
  { id: 'A', label: 'Lutador A' },
  { id: 'B', label: 'Lutador B' },
];

/**
 * Foco padrão de cada clipe: alterna entre os dois lutadores para dar ritmo de cor.
 * O usuário pode trocar em cada clipe.
 */
export function defaultFocus(take: number, beat: number, beatsPerTake: number): FocusChoice {
  const index = (take - 1) * beatsPerTake + (beat - 1);
  return index % 2 === 0 ? 'A' : 'B';
}
