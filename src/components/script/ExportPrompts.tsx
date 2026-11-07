'use client';

import { STYLES } from '@/domain/styles';
import { downloadBlob } from '@/lib/download';
import { slugify } from '@/lib/slug';
import { buildScriptText } from '@/services/script/exportScriptText';
import { useStudioStore } from '@/store/useStudioStore';
import { CopyButton } from '../ui/CopyButton';

/** Baixa ou copia o roteiro inteiro, com os 9 prompts prontos, em um texto só. */
export function ExportPrompts() {
  const script = useStudioStore((s) => s.script);
  const a = useStudioStore((s) => s.fighters.A);
  const b = useStudioStore((s) => s.fighters.B);
  const styleId = useStudioStore((s) => s.style);
  const lang = useStudioStore((s) => s.promptLang);

  if (!script) return null;

  const nameA = a?.name ?? 'Lutador A';
  const nameB = b?.name ?? 'Lutador B';
  const text = buildScriptText(script, { nameA, nameB, styleLabel: STYLES[styleId].label, lang });
  const fileName = `batalha-${slugify(nameA)}-vs-${slugify(nameB)}.txt`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), fileName)}
        className="rounded-[4px] border border-line bg-raised px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-mute"
      >
        Baixar roteiro (.txt)
      </button>
      <CopyButton text={text} label="Copiar todos os prompts" />
    </div>
  );
}
