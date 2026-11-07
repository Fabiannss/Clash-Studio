import type { CameraId } from './cameras';

export type FighterSlot = 'A' | 'B';
export type TakeIndex = 1 | 2 | 3;

export interface Fighter {
  slot: FighterSlot;
  name: string;
  franchise: string;
  summary: string;
  abilities: string[];
  speed: string;
  signatureMoves: string[];
  /** Descrição visual usada para estilizar o personagem em live-action. */
  visualDescription: string;
  imageUrl?: string;
  sourceUrl?: string;
}

/** Resultado bruto de uma busca, antes de virar Fighter. */
export interface FighterCandidate {
  id: string;
  name: string;
  franchise: string;
  imageUrl?: string;
  description: string;
  sourceUrl?: string;
}

export interface Beat {
  /** 1..3 dentro do take. */
  order: number;
  seconds: number;
  /** Plano de câmera do sub-clipe; entra no início do prompt enviado ao Flow. */
  camera: CameraId;
  prompt: string;
}

export interface Take {
  index: TakeIndex;
  title: string;
  startSec: number;
  endSec: number;
  videoPrompt: string;
  cameraMoves: string[];
  sfx: string[];
  /** Efeitos visuais do take (rastros, partículas, ondas de choque etc.). */
  vfx: string[];
  combatPhysics: string;
  negativePrompt: string;
  beats: Beat[];
}

export interface BattleScript {
  setting: string;
  takes: Take[];
}

/** Identifica um sub-clipe enviado: take + posição. */
export interface ClipKey {
  take: TakeIndex;
  beat: number;
}

export interface UploadedClip {
  key: ClipKey;
  fileName: string;
  /** Blob original do MP4 baixado do Flow. */
  file: File;
  /** URL local para preview. */
  previewUrl: string;
}

export interface PublishCopy {
  youtube: { titles: string[]; description: string; tags: string[] };
  tiktok: { captions: string[]; hashtags: string[] };
}
