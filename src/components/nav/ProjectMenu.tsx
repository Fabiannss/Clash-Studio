'use client';

import { useState } from 'react';
import { clearMedia } from '@/lib/storage/mediaDb';
import { useStudioStore } from '@/store/useStudioStore';

/** Indica que o projeto é salvo sozinho e permite começar um novo. */
export function ProjectMenu() {
  const [confirming, setConfirming] = useState(false);

  async function startNew() {
    useStudioStore.getState().resetAll();
    await clearMedia().catch(() => undefined);
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div role="alertdialog" aria-label="Confirmar novo projeto" className="flex items-center gap-2 text-xs">
        <span className="hidden text-act2 md:inline">Apagar lutadores, roteiro e vídeos?</span>
        <button
          type="button"
          onClick={startNew}
          className="rounded-[4px] bg-act3 px-3 py-1.5 font-semibold text-ink"
        >
          Apagar
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-[4px] border border-line px-3 py-1.5 text-mute hover:border-mute hover:text-ink"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="hidden font-mono text-mute md:inline">Salvo automaticamente</span>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-[4px] border border-line px-3 py-1.5 text-mute hover:border-mute hover:text-ink"
      >
        Novo projeto
      </button>
    </div>
  );
}
