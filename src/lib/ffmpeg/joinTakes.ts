import { CROSSFADE_SECONDS } from '@/domain/constants';
import { runFfmpeg } from './run';

/**
 * Junta os takes com crossfade de vídeo e de áudio.
 * `durations` são as durações reais de cada arquivo de take.
 */
export async function joinTakes(
  inputs: string[],
  durations: number[],
  output: string,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  const cf = CROSSFADE_SECONDS;
  const videoSteps: string[] = [];
  const audioSteps: string[] = [];

  let elapsed = durations[0];
  let videoLabel = '0:v';
  let audioLabel = '0:a';

  for (let i = 1; i < inputs.length; i++) {
    const offset = (elapsed - cf).toFixed(3);
    const v = i === inputs.length - 1 ? 'v' : `v${i}`;
    const a = i === inputs.length - 1 ? 'a' : `a${i}`;
    videoSteps.push(`[${videoLabel}][${i}:v]xfade=transition=fade:duration=${cf}:offset=${offset}[${v}]`);
    audioSteps.push(`[${audioLabel}][${i}:a]acrossfade=d=${cf}[${a}]`);
    videoLabel = v;
    audioLabel = a;
    elapsed = elapsed + durations[i] - cf;
  }

  await runFfmpeg(
    [
      ...inputs.flatMap((name) => ['-i', name]),
      '-filter_complex', [...videoSteps, ...audioSteps].join(';'),
      '-map', '[v]', '-map', '[a]',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k',
      output,
    ],
    onProgress,
  );
}
