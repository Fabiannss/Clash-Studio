import { runFfmpeg } from './run';

/** Descobre se o arquivo tem trilha de áudio lendo o log de `ffmpeg -i`. */
export async function hasAudioStream(fileName: string): Promise<boolean> {
  // Sem arquivo de saída o FFmpeg "falha", mas imprime os streams antes.
  const { log } = await runFfmpeg(['-i', fileName], undefined, { allowFailure: true });
  return /Stream #\d+:\d+.*Audio:/.test(log);
}
