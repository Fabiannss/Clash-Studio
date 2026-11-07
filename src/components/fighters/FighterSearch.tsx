'use client';

import { useState } from 'react';
import type { FighterCandidate, FighterSlot } from '@/domain/types';
import { searchFighters } from '@/services/fighters/searchFighters';
import { slotAccent } from '../ui/accents';

interface Props {
  slot: FighterSlot;
  onPick: (candidate: FighterCandidate) => void;
}

const EXAMPLES: Record<FighterSlot, string> = {
  A: 'Guts (Berserk)',
  B: 'Zoro (One Piece)',
};

/** Busca por nome e mostra os candidatos para o usuário escolher. */
export function FighterSearch({ slot, onPick }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FighterCandidate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setResults(await searchFighters(query));
    } catch (e) {
      setResults(null);
      setError(e instanceof Error ? e.message : 'Falha na busca.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Ex.: ${EXAMPLES[slot]}`}
          aria-label={`Buscar lutador ${slot}`}
          className="min-w-0 flex-1 rounded-[4px] border border-line bg-base px-3 py-2 text-sm placeholder:text-mute focus:border-playhead focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className={`rounded-[4px] px-4 py-2 text-sm font-semibold text-canvas disabled:opacity-40 ${slotAccent[slot].bg}`}
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      <p className="text-xs text-mute">
        Use o formato <span className="font-mono">Nome (Franquia)</span> para achar mais rápido.
      </p>

      {error && <p className="text-sm text-act3">{error}</p>}
      {results && results.length === 0 && (
        <p className="text-sm text-mute">Nenhum resultado. Tente o nome em inglês ou sem a franquia.</p>
      )}

      {results && results.length > 0 && (
        <ul className="flex flex-col divide-y divide-line rounded-[4px] border border-line">
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onPick(c)}
                className="flex w-full items-start gap-3 p-3 text-left hover:bg-raised"
              >
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl} alt="" className="h-14 w-10 shrink-0 rounded-[3px] object-cover" />
                ) : (
                  <div className="h-14 w-10 shrink-0 rounded-[3px] bg-raised" />
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{c.name}</span>
                  <span className="block text-xs text-mute">{c.franchise}</span>
                  <span className="mt-1 line-clamp-2 block text-xs text-mute">{c.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
