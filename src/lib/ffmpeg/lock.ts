// O FFmpeg WASM é uma instância única com um sistema de arquivos compartilhado:
// duas montagens ao mesmo tempo se atrapalhariam. Este bloqueio as coloca em fila.

let tail: Promise<unknown> = Promise.resolve();

export function withFfmpegLock<T>(work: () => Promise<T>): Promise<T> {
  const result = tail.then(work, work);
  tail = result.catch(() => undefined);
  return result;
}
