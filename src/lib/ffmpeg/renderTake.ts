import { BEAT_SECONDS } from '@/domain/constants';
import { readOutput, removeFiles, writeInput } from './files';
import { joinTake } from './joinTake';
import { withFfmpegLock } from './lock';
import { normalizeClip } from './normalize';

export interface RenderTakeInput {
  /** Os 3 clipes do take, na ordem. */
  clips: File[];
  onProgress: (stage: string, overall: number) => void;
}

/** Junta os 3 clipes de um take em um vídeo único de 20s (8s + 8s + 4s), para prévia. */
export function renderTake(input: RenderTakeInput): Promise<Blob> {
  return withFfmpegLock(async () => {
    if (input.clips.length !== BEAT_SECONDS.length) {
      throw new Error(`Um take precisa de ${BEAT_SECONDS.length} clipes.`);
    }
    const created: string[] = [];
    const total = BEAT_SECONDS.length + 0.5;
    const report = (stage: string, done: number) => input.onProgress(stage, Math.min(1, done / total));

    try {
      const parts: string[] = [];
      for (let i = 0; i < BEAT_SECONDS.length; i++) {
        const raw = `pv-raw-${i + 1}.mp4`;
        const norm = `pv-norm-${i + 1}.mp4`;
        created.push(raw, norm);
        parts.push(norm);
        await writeInput(raw, input.clips[i]);
        report(`Padronizando clipe ${i + 1} de ${BEAT_SECONDS.length}`, i);
        await normalizeClip(raw, norm, BEAT_SECONDS[i], (f) =>
          report(`Padronizando clipe ${i + 1} de ${BEAT_SECONDS.length}`, i + f),
        );
      }

      const out = 'pv-take.mp4';
      created.push(out);
      report('Juntando os clipes', BEAT_SECONDS.length);
      await joinTake(parts, out);
      report('Pronto', total);
      return await readOutput(out, 'video/mp4');
    } finally {
      await removeFiles(created);
    }
  });
}
