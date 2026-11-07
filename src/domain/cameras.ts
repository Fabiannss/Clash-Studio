import type { PromptLang } from './lang';

export type CameraId =
  | 'wide'
  | 'close-up'
  | 'low-angle'
  | 'high-angle'
  | 'over-shoulder'
  | 'weapon-close'
  | 'orbit'
  | 'tracking'
  | 'pov'
  | 'drone'
  | 'dutch';

export interface CameraShot {
  id: CameraId;
  /** Nome em português, mostrado na interface. */
  label: string;
  /** Frase em inglês que entra no início do prompt do clipe (posição, lente e movimento). */
  prompt: string;
  /** A mesma frase em português. */
  promptPt: string;
  /** Onde a câmera fica, em português (para o roteiro em texto e a interface). */
  position: string;
  /** Como a câmera se move, em português. */
  movement: string;
  lens: string;
}

export const CAMERA_SHOTS: Record<CameraId, CameraShot> = {
  wide: {
    id: 'wide',
    label: 'Plano geral aberto',
    prompt:
      'Wide establishing shot from a pulled-back eye-level camera, both fighters full-body in frame with the whole arena visible, 24mm lens, locked-off with a very slow pull-back',
    promptPt:
      'Plano geral de abertura, câmera recuada na altura dos olhos, os dois lutadores de corpo inteiro com toda a arena visível, lente 24mm, câmera fixa com um recuo muito lento',
    position: 'Câmera recuada, na altura dos olhos, mostrando os dois lutadores de corpo inteiro e toda a arena.',
    movement: 'Fixa, com um recuo muito lento.',
    lens: 'Grande-angular 24mm',
  },
  'close-up': {
    id: 'close-up',
    label: 'Close nos rostos',
    prompt:
      "Extreme close-up from about one meter away at eye level, framing only the fighters' faces and eyes, 85mm lens, shallow depth of field, slow push-in",
    promptPt:
      'Close extremo a cerca de um metro, na altura dos olhos, enquadrando apenas os rostos e os olhares dos lutadores, lente 85mm, fundo desfocado, aproximação lenta',
    position: 'Câmera a cerca de 1 metro, na altura dos olhos, enquadrando só o rosto e o olhar.',
    movement: 'Aproximação lenta (push-in).',
    lens: 'Teleobjetiva 85mm, fundo desfocado',
  },
  'low-angle': {
    id: 'low-angle',
    label: 'Contra-plongée (câmera baixa)',
    prompt:
      'Low-angle shot with the camera at ground level tilted upward, fighters towering against the sky, 24mm lens, slow rise',
    promptPt:
      'Plano em contra-plongée, câmera rente ao chão inclinada para cima, lutadores imponentes contra o céu, lente 24mm, subida lenta',
    position: 'Câmera rente ao chão, inclinada para cima, enquadrando os lutadores de baixo.',
    movement: 'Subida lenta.',
    lens: 'Grande-angular 24mm',
  },
  'high-angle': {
    id: 'high-angle',
    label: 'Plongée (câmera alta)',
    prompt: 'High-angle shot with the camera above the fighters tilted downward, 35mm lens, slow descending move',
    promptPt: 'Plano em plongée, câmera acima dos lutadores inclinada para baixo, lente 35mm, descida lenta',
    position: 'Câmera acima dos lutadores, inclinada para baixo.',
    movement: 'Descida lenta.',
    lens: '35mm',
  },
  'over-shoulder': {
    id: 'over-shoulder',
    label: 'Sobre o ombro',
    prompt:
      "Over-the-shoulder shot with the camera right behind one fighter's shoulder looking at the opponent, 50mm lens, subtle handheld follow",
    promptPt:
      'Plano sobre o ombro, câmera logo atrás do ombro de um lutador olhando para o adversário, lente 50mm, acompanhamento leve com câmera na mão',
    position: 'Câmera logo atrás do ombro de um lutador, olhando para o adversário.',
    movement: 'Acompanhamento leve, com câmera na mão.',
    lens: '50mm',
  },
  'weapon-close': {
    id: 'weapon-close',
    label: 'Close na arma e no impacto',
    prompt:
      'Close-up with the camera right next to the weapons, following the blades to the exact point of impact, 50mm lens, shallow depth of field',
    promptPt:
      'Close nas armas, câmera colada nas lâminas acompanhando o golpe até o ponto exato do impacto, lente 50mm, fundo desfocado',
    position: 'Câmera colada nas armas, no ponto onde elas se encontram.',
    movement: 'Acompanha a trajetória do golpe até o impacto.',
    lens: '50mm, fundo desfocado',
  },
  orbit: {
    id: 'orbit',
    label: 'Órbita 360°',
    prompt:
      'Camera makes a full continuous 360-degree orbit around both fighters during the whole clip, waist height, both fighters full-body in frame, 28mm lens, fast rotation that follows the fight',
    promptPt:
      'A câmera faz uma órbita completa de 360 graus ao redor dos dois lutadores durante o clipe inteiro, na altura da cintura, os dois de corpo inteiro no quadro, lente 28mm, rotação rápida acompanhando a luta',
    position: 'Câmera na altura da cintura, circulando ao redor dos dois lutadores.',
    movement: 'Rotação rápida e contínua de 360°.',
    lens: '28mm',
  },
  tracking: {
    id: 'tracking',
    label: 'Travelling lateral',
    prompt:
      'Side tracking shot with the camera running parallel to the fighters at the same speed, eye level, 35mm lens, smooth gimbal movement',
    promptPt:
      'Travelling lateral, câmera correndo paralela aos lutadores na mesma velocidade, na altura dos olhos, lente 35mm, estabilizador suave',
    position: 'Câmera ao lado dos lutadores, paralela ao movimento, na altura dos olhos.',
    movement: 'Acompanha em linha reta, na velocidade do combate, com estabilizador suave.',
    lens: '35mm',
  },
  pov: {
    id: 'pov',
    label: 'Câmera subjetiva (POV)',
    prompt: "First-person POV shot from one fighter's eyes, wide 20mm lens, head bob and slight shake",
    promptPt:
      'Câmera subjetiva (POV) pelos olhos de um dos lutadores, lente grande-angular 20mm, balanço de cabeça e leve tremor',
    position: 'Câmera nos olhos de um dos lutadores, vendo o adversário à frente.',
    movement: 'Balanço de cabeça e tremor leve.',
    lens: 'Grande-angular 20mm',
  },
  drone: {
    id: 'drone',
    label: 'Drone aéreo',
    prompt: 'Aerial drone shot high above the arena looking down at an angle, 24mm lens, slow circling descent',
    promptPt:
      'Plano aéreo de drone bem acima da arena olhando em diagonal para baixo, lente 24mm, giro lento descendo aos poucos',
    position: 'Câmera alta e distante sobre a arena, olhando de cima em diagonal.',
    movement: 'Giro lento em volta da arena, descendo aos poucos.',
    lens: '24mm',
  },
  dutch: {
    id: 'dutch',
    label: 'Plano inclinado',
    prompt: 'Dutch angle shot with the camera tilted about 20 degrees, 35mm lens, slow drift',
    promptPt: 'Plano inclinado, câmera torta em cerca de 20 graus, lente 35mm, deriva lenta',
    position: 'Câmera na altura dos olhos, com a linha do horizonte inclinada cerca de 20 graus.',
    movement: 'Deriva lenta, mantendo a inclinação.',
    lens: '35mm',
  },
};

export const CAMERA_LIST: CameraShot[] = Object.values(CAMERA_SHOTS);

/** Plano inicial de cada sub-clipe (take 1, 2, 3 × clipe 1, 2, 3): nenhum ângulo se repete. */
export const DEFAULT_CAMERA_PLAN: CameraId[][] = [
  ['orbit', 'close-up', 'low-angle'],
  ['tracking', 'orbit', 'over-shoulder'],
  ['dutch', 'weapon-close', 'orbit'],
];

/** Frase de câmera no idioma escolhido para os prompts. */
export function cameraPhrase(shot: CameraShot, lang: PromptLang): string {
  return lang === 'pt' ? shot.promptPt : shot.prompt;
}
