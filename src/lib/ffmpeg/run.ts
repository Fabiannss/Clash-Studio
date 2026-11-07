import { getFfmpeg } from './client';

export interface RunResult {
  /** Saída de log do FFmpeg durante o comando. */
  log: string;
}

/**
 * Executa um comando FFmpeg e lança erro se o código de saída não for 0.
 * Repassa progresso (0..1) quando o comando informa duração.
 */
export async function runFfmpeg(
  args: string[],
  onProgress?: (fraction: number) => void,
  options: { allowFailure?: boolean } = {},
): Promise<RunResult> {
  const ffmpeg = await getFfmpeg();
  const lines: string[] = [];

  const onLog = ({ message }: { message: string }) => lines.push(message);
  const onProg = ({ progress }: { progress: number }) => {
    if (onProgress && Number.isFinite(progress)) onProgress(Math.min(1, Math.max(0, progress)));
  };

  ffmpeg.on('log', onLog);
  ffmpeg.on('progress', onProg);
  try {
    const code = await ffmpeg.exec(args);
    const log = lines.join('\n');
    if (code !== 0 && !options.allowFailure) {
      const tail = lines.slice(-6).join(' | ');
      throw new Error(`FFmpeg terminou com erro ${code}: ${tail}`);
    }
    onProgress?.(1);
    return { log };
  } finally {
    ffmpeg.off('log', onLog);
    ffmpeg.off('progress', onProg);
  }
}
