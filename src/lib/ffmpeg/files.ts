import { getFfmpeg } from './client';

// Acesso ao sistema de arquivos em memória do FFmpeg.

export async function writeInput(name: string, source: Blob | string): Promise<void> {
  const ffmpeg = await getFfmpeg();
  const data =
    typeof source === 'string'
      ? new TextEncoder().encode(source)
      : new Uint8Array(await source.arrayBuffer());
  await ffmpeg.writeFile(name, data);
}

export async function readOutput(name: string, mimeType: string): Promise<Blob> {
  const ffmpeg = await getFfmpeg();
  const data = await ffmpeg.readFile(name);
  if (typeof data === 'string') return new Blob([data], { type: mimeType });
  return new Blob([data as unknown as BlobPart], { type: mimeType });
}

export async function removeFiles(names: string[]): Promise<void> {
  const ffmpeg = await getFfmpeg();
  await Promise.all(names.map((n) => ffmpeg.deleteFile(n).catch(() => undefined)));
}
