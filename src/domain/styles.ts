import { LOOK_35MM } from './constants';
import type { PromptLang } from './lang';

export type StyleId = 'live-action' | 'game-action';

export interface StyleDef {
  id: StyleId;
  label: string;
  description: string;
  /** Descrição visual repetida em todo prompt de vídeo (inglês e português). */
  look: string;
  lookPt: string;
  /** Instrução em português para o Gemini sobre os efeitos de cada sub-clipe. */
  vfxRules: string;
  /** Frase de efeitos usada no roteiro de modelo (inglês e português). */
  vfxPhrase: string;
  vfxPhrasePt: string;
  /** Efeitos sugeridos por take (1, 2, 3) no roteiro de modelo. */
  templateVfx: [string[], string[], string[]];
  negative: string;
  negativePt: string;
}

export const STYLES: Record<StyleId, StyleDef> = {
  'live-action': {
    id: 'live-action',
    label: 'Live-action 35mm',
    description: 'Cinema realista, com física crível e efeitos práticos.',
    look: LOOK_35MM,
    lookPt:
      'cinema live-action realista, filmado em película 35mm, lente anamórfica, grão de filme natural, ' +
      'texturas realistas de pele e tecido, iluminação prática, alta faixa dinâmica',
    vfxRules:
      'Use efeitos práticos e discretos: poeira, fagulhas e fumaça reais, sem rastros luminosos ou brilhos irreais.',
    vfxPhrase: 'practical effects only, real dust and sparks, no glowing trails',
    vfxPhrasePt: 'apenas efeitos práticos, poeira e fagulhas reais, sem rastros luminosos',
    templateVfx: [
      ['poeira levantando no chão', 'fagulhas no choque das lâminas'],
      ['detritos voando', 'fagulhas a cada golpe'],
      ['onda de poeira e fumaça', 'clarão curto no impacto'],
    ],
    negative: 'cartoon look, cel shading, game HUD, text, subtitles, watermark, deformed hands, extra limbs',
    negativePt: 'visual de desenho animado, cel shading, interface de jogo, texto, legendas, marca d\'água, mãos deformadas, membros extras',
  },
  'game-action': {
    id: 'game-action',
    label: 'Jogo de ação cinematográfico',
    description: 'Cinemática de jogo de ação: rastros de lâmina, partículas, ondas de choque e pausas de impacto.',
    look:
      'cinematic action-game cutscene look, rendered like a high-end game engine, dramatic colored contrast ' +
      'lighting, volumetric light and fog, sharp detail, realistic character proportions',
    lookPt:
      'visual de cinemática de jogo de ação, renderizado como um motor gráfico de ponta, iluminação dramática ' +
      'com contraste de cores, luz volumétrica e névoa, detalhes nítidos, proporções realistas dos personagens',
    vfxRules:
      'Inclua em todo sub-clipe efeitos de jogo de ação: rastros luminosos nas armas, fagulhas e partículas ' +
      'em cada impacto, ondas de choque, uma pausa curta no instante do golpe seguida de aceleração, e tremor ' +
      'de câmera nos choques. Os efeitos crescem de intensidade ao longo dos 3 takes.',
    vfxPhrase:
      'glowing blade trails, impact sparks and particles, radial shockwaves, brief hit-stop freeze then speed ramp, ' +
      'camera shake on impact',
    vfxPhrasePt:
      'rastros luminosos nas lâminas, fagulhas e partículas no impacto, ondas de choque radiais, breve pausa de ' +
      'impacto seguida de aceleração, tremor de câmera no impacto',
    templateVfx: [
      ['rastro luminoso fino nas lâminas', 'poeira e brasas levantando no impacto'],
      ['rastros de lâmina em arco', 'fagulhas e partículas a cada choque', 'pausa curta no instante do golpe'],
      ['ondas de choque radiais', 'explosão de partículas e luz', 'câmera lenta no pico do impacto'],
    ],
    negative:
      'text, subtitles, watermark, game HUD, health bars, UI elements, deformed hands, extra limbs, blurry low-poly look',
    negativePt:
      'texto, legendas, marca d\'água, HUD de jogo, barras de vida, elementos de interface, mãos deformadas, membros extras, visual de baixo polígono borrado',
  },
};

export const STYLE_LIST: StyleDef[] = Object.values(STYLES);

export const pickLook = (style: StyleDef, lang: PromptLang): string => (lang === 'pt' ? style.lookPt : style.look);
export const pickVfxPhrase = (style: StyleDef, lang: PromptLang): string =>
  lang === 'pt' ? style.vfxPhrasePt : style.vfxPhrase;
export const pickNegative = (style: StyleDef, lang: PromptLang): string =>
  lang === 'pt' ? style.negativePt : style.negative;
