import { TOTAL_SECONDS } from '@/domain/constants';
import { runFfmpeg } from './run';

export interface MusicOptions {
  /** Nome do arquivo de música já gravado no FFmpeg; null usa a trilha sintetizada. */
  musicFile: string | null;
  /** Mantém o áudio dos clipes (efeitos do Veo) e abaixa a trilha quando eles soam. */
  keepClipAudio: boolean;
}

/** Entradas e rótulo [m0] da trilha: arquivo enviado ou drone sintetizado. */
function musicSource(musicFile: string | null): { inputs: string[]; filter: string } {
  if (musicFile) {
    return { inputs: ['-stream_loop', '-1', '-i', musicFile], filter: '[1:a]anull[m0]' };
  }
  const sine = (hz: number) => ['-f', 'lavfi', '-i', `sine=frequency=${hz}:duration=${TOTAL_SECONDS}`];
  return {
    inputs: [...sine(55), ...sine(82.41), ...sine(110)],
    filter: '[1:a][2:a][3:a]amix=inputs=3:duration=longest,lowpass=f=500,tremolo=f=0.4:d=0.5,volume=4[m0]',
  };
}

/**
 * Coloca a trilha contínua sobre o vídeo. Com `keepClipAudio`, usa sidechain
 * para a trilha ceder espaço aos sons dos clipes. Fecha com normalização de volume.
 */
export async function mixMusic(
  video: string,
  output: string,
  { musicFile, keepClipAudio }: MusicOptions,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  const source = musicSource(musicFile);
  const fadeOutStart = TOTAL_SECONDS - 3.5;

  const musicChain =
    `[m0]aresample=44100,aformat=channel_layouts=stereo,` +
    `afade=t=in:st=0:d=1.5,afade=t=out:st=${fadeOutStart}:d=3.5[m]`;

  const mixChain = keepClipAudio
    ? '[0:a]aresample=44100,asplit=2[c1][c2];' +
      '[m][c1]sidechaincompress=threshold=0.04:ratio=6:attack=15:release=350[md];' +
      '[c2][md]amix=inputs=2:duration=first:dropout_transition=0,volume=2[mix]'
    : '[m]anull[mix]';

  const filter = [source.filter, musicChain, mixChain, '[mix]loudnorm=I=-16:TP=-1.5:LRA=11[a]'].join(';');

  await runFfmpeg(
    [
      '-i', video,
      ...source.inputs,
      '-filter_complex', filter,
      '-map', '0:v:0', '-map', '[a]',
      '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '192k',
      '-t', String(TOTAL_SECONDS),
      '-movflags', '+faststart',
      output,
    ],
    onProgress,
  );
}
