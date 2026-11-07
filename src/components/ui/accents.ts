import type { FighterSlot, TakeIndex } from '@/domain/types';

// Classes completas (o Tailwind só gera o que aparece escrito por inteiro).

export const slotAccent: Record<FighterSlot, { text: string; border: string; bg: string }> = {
  A: { text: 'text-fighterA', border: 'border-fighterA', bg: 'bg-fighterA' },
  B: { text: 'text-fighterB', border: 'border-fighterB', bg: 'bg-fighterB' },
};

export const actAccent: Record<TakeIndex, { text: string; border: string; bg: string; dim: string }> = {
  1: { text: 'text-act1', border: 'border-act1', bg: 'bg-act1', dim: 'bg-act1/20' },
  2: { text: 'text-act2', border: 'border-act2', bg: 'bg-act2', dim: 'bg-act2/20' },
  3: { text: 'text-act3', border: 'border-act3', bg: 'bg-act3', dim: 'bg-act3/20' },
};
