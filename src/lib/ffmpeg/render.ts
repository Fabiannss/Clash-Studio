import { allClipKeys, clipId, clipSeconds, takeSeconds } from '@/domain/clips';
import { BEATS_PER_TAKE, TAKE_COUNT } from '@/domain/constants';
import type { TakeIndex } from '@/domain/types';
import { readOutput, removeFiles, writeInput } from './files';
import type { ClipFxPlan } from './fxFilters';
import { joinTake } from './joinTake';
import { joinTakes } from './joinTakes';
import { withFfmpegLock } from './lock';
import { mixMusic } from './music';
import { normalizeClip } from './normalize';

export interface RenderInput {
  /** Arquivos enviados, indexados por clipId ("take-beat"). */
  clips: Map<string, File>;
  music: File | null;
  keepClipAudio: boolean;
  /** Efeitos de cada clipe; sem isso, os clipes só são padronizados. */
  fxFor?: (take: number, beat: number, seconds: number) => ClipFxPlan;
  onProgress: (stage: string, overall: number) => void;
}

export interface RenderResult {
  final: Blob;
  /** Um arquivo por take, para preview individual. */
  takes: Blob[];
}

interface Stage {
  label: string;
  weight: number;
}

/** Acompanha o progresso global somando o peso de cada etapa. */
function createTracker(stages: Stage[], report: RenderInput['onProgress']) {
  const total = stages.reduce((s, st) => s + st.weight, 0);
  let done = 0;
  return {
    async run(index: number, work: (local: (f: number) => void) => Promise<void>) {
      const stage = stages[index];
      report(stage.label, done / total);
      await work((f) => report(stage.label, (done + stage.weight * f) / total));
      done += stage.weight;
      report(stage.label, done / total);
    },
  };
}

export function renderBattle(input: RenderInput): Promise<RenderResult> {
  return withFfmpegLock(() => renderBattleUnlocked(input));
}

async function renderBattleUnlocked(input: RenderInput): Promise<RenderResult> {
  const keys = allClipKeys();
  const missing = keys.filter((k) => !input.clips.has(clipId(k)));
  if (missing.length > 0) {
    throw new Error(`Faltam ${missing.length} sub-clipe(s) para montar o vídeo.`);
  }

  const stages: Stage[] = [
    ...keys.map((k) => ({ label: `Padronizando clipe ${k.take}.${k.beat}`, weight: 4 })),
    ...Array.from({ length: TAKE_COUNT }, (_, i) => ({ label: `Montando take ${i + 1}`, weight: 0.5 })),
    { label: 'Unindo takes com crossfade', weight: 6 },
    { label: 'Aplicando trilha e mixagem', weight: 4 },
  ];
  const tracker = createTracker(stages, input.onProgress);
  const created: string[] = [];
  let step = 0;

  try {
    // 1. Padroniza cada sub-clipe.
    for (const key of keys) {
      const raw = `raw-${clipId(key)}.mp4`;
      const norm = `norm-${clipId(key)}.mp4`;
      created.push(raw, norm);
      await writeInput(raw, input.clips.get(clipId(key))!);
      const seconds = clipSeconds(key);
      await tracker.run(step++, (local) =>
        normalizeClip(raw, norm, seconds, local, input.fxFor?.(key.take, key.beat, seconds)),
      );
    }

    // 2. Une os sub-clipes de cada take.
    const takeFiles: string[] = [];
    for (let t = 1; t <= TAKE_COUNT; t++) {
      const parts = Array.from({ length: BEATS_PER_TAKE }, (_, b) => `norm-${t}-${b + 1}.mp4`);
      const out = `take-${t}.mp4`;
      created.push(out);
      takeFiles.push(out);
      await tracker.run(step++, () => joinTake(parts, out));
    }

    // 3. Crossfade entre takes.
    const joined = 'joined.mp4';
    created.push(joined);
    const durations = Array.from({ length: TAKE_COUNT }, (_, i) => takeSeconds((i + 1) as TakeIndex));
    await tracker.run(step++, (local) => joinTakes(takeFiles, durations, joined, local));

    // 4. Trilha e mixagem final.
    const final = 'final.mp4';
    created.push(final);
    let musicName: string | null = null;
    if (input.music) {
      musicName = 'music-input';
      created.push(musicName);
      await writeInput(musicName, input.music);
    }
    await tracker.run(step++, (local) =>
      mixMusic(joined, final, { musicFile: musicName, keepClipAudio: input.keepClipAudio }, local),
    );

    const takes = await Promise.all(takeFiles.map((name) => readOutput(name, 'video/mp4')));
    return { final: await readOutput(final, 'video/mp4'), takes };
  } finally {
    await removeFiles(created);
  }
}
