import type { FFmpeg } from '@ffmpeg/ffmpeg';

// Uma única instância do FFmpeg WASM por aba.
//
// A biblioteca e o núcleo (~30 MB) vêm de /ffmpeg, copiados para public/ pelo
// script postinstall. A biblioteca é carregada por <script> (versão UMD) e não
// pelo webpack: empacotar @ffmpeg/ffmpeg no Next.js quebra o worker e gera o erro
// "Falha ao carregar o bloco ... ffmpeg_dist_esm_index_js".

type FfmpegConstructor = new () => FFmpeg;

declare global {
  interface Window {
    FFmpegWASM?: { FFmpeg: FfmpegConstructor };
  }
}

const LIBRARY_URL = '/ffmpeg/ffmpeg.js';

let instance: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;
let libraryLoading: Promise<FfmpegConstructor> | null = null;

function loadLibrary(): Promise<FfmpegConstructor> {
  if (window.FFmpegWASM) return Promise.resolve(window.FFmpegWASM.FFmpeg);
  if (libraryLoading) return libraryLoading;

  libraryLoading = new Promise<FfmpegConstructor>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = LIBRARY_URL;
    script.async = true;
    script.onload = () => {
      if (window.FFmpegWASM) resolve(window.FFmpegWASM.FFmpeg);
      else reject(new Error('O arquivo do FFmpeg carregou, mas não expôs a biblioteca.'));
    };
    script.onerror = () => {
      script.remove();
      reject(
        new Error(
          `Não consegui carregar ${LIBRARY_URL}. Rode "npm install" de novo para copiar os arquivos do FFmpeg para public/ffmpeg.`,
        ),
      );
    };
    document.head.appendChild(script);
  }).catch((error) => {
    libraryLoading = null; // permite tentar de novo
    throw error;
  });

  return libraryLoading;
}

export function getFfmpeg(): Promise<FFmpeg> {
  if (instance?.loaded) return Promise.resolve(instance);
  if (loading) return loading;

  loading = (async () => {
    const FFmpegClass = await loadLibrary();
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
