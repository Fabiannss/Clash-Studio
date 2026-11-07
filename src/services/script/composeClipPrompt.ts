import { CAMERA_SHOTS, cameraPhrase } from '@/domain/cameras';
import type { PromptLang } from '@/domain/lang';
import type { Beat } from '@/domain/types';

/** Texto final que o usuário cola no Flow: plano de câmera + descrição da ação. */
export function composeClipPrompt(beat: Beat, lang: PromptLang): string {
  return `${cameraPhrase(CAMERA_SHOTS[beat.camera], lang)}. ${beat.prompt}`;
}
