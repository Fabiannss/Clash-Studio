'use client';

import { useRef } from 'react';
import { useStudioStore } from '@/store/useStudioStore';

/** Trilha sonora (arquivo próprio ou drone sintetizado) e mixagem com o áudio dos clipes. */
export function MusicOptions() {
  const music = useStudioStore((s) => s.music);
  const setMusic = useStudioStore((s) => s.setMusic);
  const keepClipAudio = useStudioStore((s) => s.keepClipAudio);
  const setKeepClipAudio = useStudioStore((s) => s.setKeepClipAudio);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4 rounded-[4px] bg-surface p-5">
      <h2 className="text-lg font-extrabold">Trilha sonora</h2>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-[4px] border border-line px-4 py-2 text-sm hover:border-mute"
          >
            {music ? 'Trocar música' : 'Enviar minha música'}
          </button>
          {music && (
            <button
              type="button"
              onClick={() => setMusic(null)}
              className="text-xs text-mute underline hover:text-ink"
            >
              Remover
            </button>
          )}
        </div>
        <p className="text-xs text-mute">
          {music
            ? `Usando: ${music.name}. A música repete até completar 60s, com entrada e saída suaves.`
            : 'Sem arquivo, o app usa um drone instrumental simples gerado pelo FFmpeg. Envie uma música sua para um resultado melhor.'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            setMusic(e.target.files?.[0] ?? null);
            e.target.value = '';
          }}
        />
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={keepClipAudio}
          onChange={(e) => setKeepClipAudio(e.target.checked)}
          className="mt-1 h-4 w-4 accent-[#FFC247]"
        />
        <span>
          Manter o áudio dos clipes
          <span className="block text-xs text-mute">
            Os efeitos sonoros gerados pelo Veo continuam, e a trilha abaixa quando eles aparecem.
          </span>
        </span>
      </label>
    </div>
  );
}
