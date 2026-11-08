import { OUTPUT } from '@/domain/constants';
import { buildFxFilters, type ClipFxPlan } from './fxFilters';
import { hasAudioStream } from './probe';
import { runFfmpeg } from './run';

/**
 * Padroniza um clipe (resolução, fps, codecs) e corta na duração pedida.
 * Clipes padronizados podem ser concatenados sem recodificar.
 * Se o clipe não tiver áudio, entra uma faixa silenciosa para manter a estrutura.
 */
export async function normalizeClip(
  input: string,
  output: string,
  seconds: number,
  onProgress?: (fraction: number) => void,
  fx?: ClipFxPlan,
): Promise<void> {
  const { width, height, fps } = OUTPUT;
  const withAudio = await hasAudioStream(input);

  const effects = fx ? buildFxFilters(fx) : { beforeFps: [], afterFps: [] };
  const videoFilter = [
    `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
    ...effects.beforeFps,
    `fps=${fps}`,
    ...effects.afterFps,
    // tpad repete o último quadro: se o clipe vier um pouco mais curto que o necessário (ex.: 4s no
    // lugar de 4,3s), o take não encolhe. O corte exato fica por conta do -t abaixo.
    'tpad=stop_mode=clone:stop_duration=1',
    'format=yuv420p',
    'setsar=1',
  ].join(',');
  const audioFilter = 'aresample=44100,aformat=channel_layouts=stereo,apad';

  const args = withAudio
    ? ['-i', input, '-map', '0:v:0', '-map', '0:a:0', '-af', audioFilter]
    : ['-i', input, '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-map', '0:v:0', '-map', '1:a:0'];

  await runFfmpeg(
    [
      ...args,
      '-t', seconds.toFixed(3),
      '-vf', videoFilter,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
      '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-ac', '2',
      '-movflags', '+faststart',
      output,
    ],
    onProgress,
  );
}
