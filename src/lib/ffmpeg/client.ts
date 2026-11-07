import type { FFmpeg } from '@ffmpeg/ffmpeg';

// Uma única instância do FFmpeg WASM por aba. O núcleo (~30 MB) vem de
// /ffmpeg/core, copiado para public/ pelo script postinstall.

let instance: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;

export function getFfmpeg(): Promise<FFmpeg> {
  if (instance?.loaded) return Promise.resolve(instance);
  if (loading) return loading;

  loading = (async () => {
    // Import dinâmico: o FFmpeg só existe no navegador.
    const { FFmpeg: FFmpegClass } = await import('@ffmpeg/ffmpeg');
    const ffmpeg = new FFmpegClass();
    await ffmpeg.load({
      coreURL: '/ffmpeg/core/ffmpeg-core.js',
      wasmURL: '/ffmpeg/core/ffmpeg-core.wasm',
    });
    instance = ffmpeg;
    return ffmpeg;
  })().catch((error) => {
    loading = null; // permite tentar de novo
    throw error;
  });

  return loading;
}
