'use client';

import type { FighterCandidate, FighterSlot } from '@/domain/types';
import { draftFighter } from '@/services/prompts/fighterSheetPrompt';
import { useStudioStore } from '@/store/useStudioStore';
import { slotAccent } from '../ui/accents';
import { FighterSearch } from './FighterSearch';
import { FighterSheet } from './FighterSheet';

/** Coluna de um lutador: busca enquanto vazio, ficha editável depois de escolher. */
export function FighterSlotPanel({ slot }: { slot: FighterSlot }) {
  const fighter = useStudioStore((s) => s.fighters[slot]);
  const setFighter = useStudioStore((s) => s.setFighter);
  const accent = slotAccent[slot];

  function handlePick(candidate: FighterCandidate) {
    setFighter(slot, draftFighter(candidate, slot));
  }

  return (
    <section className={`flex flex-col gap-4 rounded-[4px] border-t-2 bg-surface p-5 ${accent.border}`}>
      <h2 className={`text-sm font-semibold ${accent.text}`}>Lutador {slot}</h2>
      {fighter ? <FighterSheet fighter={fighter} /> : <FighterSearch slot={slot} onPick={handlePick} />}
    </section>
  );
}
