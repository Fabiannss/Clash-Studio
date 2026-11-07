'use client';

import { useStudioStore } from '@/store/useStudioStore';
import { slotAccent } from '../ui/accents';
import { ProjectMenu } from './ProjectMenu';

/** Barra superior: marca à esquerda e o confronto escolhido ao centro. */
export function VersusHeader() {
  const a = useStudioStore((s) => s.fighters.A);
  const b = useStudioStore((s) => s.fighters.B);

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-4 py-2.5 md:px-6">
      <span className="text-base font-extrabold tracking-tight">
        Clash <span className="text-playhead">Studio</span>
      </span>

      <p className="min-w-0 truncate text-sm font-semibold" aria-live="polite">
        {a || b ? (
          <>
            <span className={a ? slotAccent.A.text : 'text-mute'}>{a?.name ?? 'Lutador A'}</span>
            <span className="mx-2 text-mute">×</span>
            <span className={b ? slotAccent.B.text : 'text-mute'}>{b?.name ?? 'Lutador B'}</span>
          </>
        ) : (
          <span className="font-normal text-mute">Batalhas de 60 segundos em live-action</span>
        )}
      </p>

      <ProjectMenu />
    </header>
  );
}
