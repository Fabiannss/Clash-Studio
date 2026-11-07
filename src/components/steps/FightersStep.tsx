'use client';

import { useStudioStore } from '@/store/useStudioStore';
import { FighterSlotPanel } from '../fighters/FighterSlotPanel';

export function FightersStep() {
  const a = useStudioStore((s) => s.fighters.A);
  const b = useStudioStore((s) => s.fighters.B);
  const setStep = useStudioStore((s) => s.setStep);
  const ready = Boolean(a && b);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Escolha os dois lutadores</h1>
        <p className="mt-1 max-w-prose text-sm text-mute">
          Busque personagens de universos diferentes. Os dados vêm do AniList e da Wikipedia, e você pode
          corrigir qualquer campo da ficha.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <FighterSlotPanel slot="A" />
        <FighterSlotPanel slot="B" />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!ready}
          onClick={() => setStep('script')}
          className="rounded-[4px] bg-playhead px-5 py-2.5 text-sm font-semibold text-canvas disabled:opacity-40"
        >
          Ir para o roteiro
        </button>
      </div>
    </div>
  );
}
