import { DEFAULT_CAMERA_PLAN } from '@/domain/cameras';
import { BEAT_SECONDS, TAKE_PLAN, TAKE_SECONDS } from '@/domain/constants';
import type { ScriptJson } from '@/domain/schemas';
import type { BattleScript, Take, TakeIndex } from '@/domain/types';

/** Converte o JSON validado em roteiro com tempos e durações por sub-clipe. */
export function buildScript(json: ScriptJson): BattleScript {
  const takes = json.takes.map<Take>((t, i) => {
    const index = TAKE_PLAN[i].index as TakeIndex;
    return {
      index,
      title: t.title,
      startSec: i * TAKE_SECONDS,
      endSec: (i + 1) * TAKE_SECONDS,
      videoPrompt: t.videoPrompt,
      cameraMoves: t.cameraMoves,
      sfx: t.sfx,
      vfx: t.vfx,
      combatPhysics: t.combatPhysics,
      negativePrompt: t.negativePrompt,
      beats: t.beats.map((b, order) => ({
        order: order + 1,
        seconds: BEAT_SECONDS[order],
        camera: DEFAULT_CAMERA_PLAN[i][order],
        prompt: b.prompt,
      })),
    };
  });
  return { setting: json.setting, takes };
}
