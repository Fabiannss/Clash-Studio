// Regras fixas do formato: 3 takes de 20s = 60s. O Flow gera clipes de até 8s,
// então cada take é feito de 3 sub-clipes (8s + 8s + 4s aproveitados).

export const TAKE_COUNT = 3;
export const TAKE_SECONDS = 20;
export const TOTAL_SECONDS = TAKE_COUNT * TAKE_SECONDS;
export const MAX_CLIP_SECONDS = 8;

/** Duração aproveitada de cada sub-clipe dentro de um take (soma = 20s). */
export const BEAT_SECONDS = [8, 8, 4] as const;
export const BEATS_PER_TAKE = BEAT_SECONDS.length;

export const CROSSFADE_SECONDS = 0.3;
export const OUTPUT = { width: 1280, height: 720, fps: 24 } as const;

export const TAKE_PLAN = [
  {
    index: 1,
    title: 'Encaro e primeiro choque',
    goal: 'Encaro, leitura tática e primeiro choque de lâminas ou punhos.',
  },
  {
    index: 2,
    title: 'Trocação em velocidade de anime',
    goal: 'Trocação em altíssima velocidade, esquivas rápidas e destruição de cenário.',
  },
  {
    index: 3,
    title: 'Golpes máximos e colisão',
    goal: 'Ativação dos golpes especiais máximos, colisão catastrófica e encerramento.',
  },
] as const;

export const LOOK_35MM =
  'cinematic live-action, shot on 35mm film, anamorphic lens, natural film grain, ' +
  'realistic skin and fabric textures, practical lighting, high dynamic range';
