import { CAMERA_SHOTS, DEFAULT_CAMERA_PLAN } from '@/domain/cameras';
import { TAKE_COUNT } from '@/domain/constants';
import type { BattleScript } from '@/domain/types';

/**
 * Valida um roteiro lido do armazenamento do navegador. Preenche campos que
 * versões antigas não tinham (efeitos, câmera) e descarta o que não tem conserto.
 */
export function sanitizeScript(value: unknown): BattleScript | null {
  const script = value as BattleScript | null | undefined;
  if (!script || !Array.isArray(script.takes) || script.takes.length !== TAKE_COUNT) return null;

  try {
    return {
      setting: String(script.setting ?? ''),
      takes: script.takes.map((take, i) => ({
        ...take,
        vfx: Array.isArray(take.vfx) ? take.vfx : [],
        beats: take.beats.map((beat, order) => ({
          ...beat,
          camera: beat.camera && CAMERA_SHOTS[beat.camera] ? beat.camera : DEFAULT_CAMERA_PLAN[i][order],
        })),
      })),
    };
  } catch {
    return null;
  }
}
