'use client';

import type { Fighter } from '@/domain/types';
import { useStudioStore } from '@/store/useStudioStore';
import { LinesField, TextField } from '../ui/Fields';
import { slotAccent } from '../ui/accents';
import { GeminiSheetHelper } from './GeminiSheetHelper';

/** Ficha técnica editável de um lutador escolhido. */
export function FighterSheet({ fighter }: { fighter: Fighter }) {
  const patch = useStudioStore((s) => s.patchFighter);
  const clear = useStudioStore((s) => s.setFighter);
  const accent = slotAccent[fighter.slot];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        {fighter.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fighter.imageUrl} alt="" className="h-24 w-16 shrink-0 rounded-[3px] object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className={`text-xl font-extrabold leading-tight ${accent.text}`}>{fighter.name}</h3>
          <p className="text-sm text-mute">{fighter.franchise}</p>
          {fighter.sourceUrl && (
            <a
              href={fighter.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-mute underline hover:text-ink"
            >
              Ver fonte da ficha
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={() => clear(fighter.slot, null)}
          className="rounded-[4px] border border-line px-3 py-1.5 text-xs text-mute hover:border-mute hover:text-ink"
        >
          Trocar lutador
        </button>
      </div>

      <GeminiSheetHelper fighter={fighter} />

      <TextField
        label="Resumo"
        value={fighter.summary}
        rows={3}
        onChange={(summary) => patch(fighter.slot, { summary })}
      />
      <LinesField
        label="Habilidades"
        values={fighter.abilities}
        onCommit={(abilities) => patch(fighter.slot, { abilities })}
      />
      <TextField label="Velocidade" value={fighter.speed} onChange={(speed) => patch(fighter.slot, { speed })} />
      <LinesField
        label="Golpes icônicos"
        values={fighter.signatureMoves}
        onCommit={(signatureMoves) => patch(fighter.slot, { signatureMoves })}
      />
      <TextField
        label="Visual para o vídeo (roupa, armas, cabelo, cores)"
        value={fighter.visualDescription}
        rows={3}
        onChange={(visualDescription) => patch(fighter.slot, { visualDescription })}
      />
    </div>
  );
}
