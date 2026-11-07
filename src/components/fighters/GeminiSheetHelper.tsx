'use client';

import { useState } from 'react';
import { fighterSheetSchema } from '@/domain/schemas';
import type { Fighter } from '@/domain/types';
import { parseWithSchema } from '@/services/parsing/extractJson';
import { buildSheetPrompt } from '@/services/prompts/fighterSheetPrompt';
import { useStudioStore } from '@/store/useStudioStore';
import { CopyButton } from '../ui/CopyButton';

/** Passo opcional: o Gemini completa a ficha técnica a partir de um prompt. */
export function GeminiSheetHelper({ fighter }: { fighter: Fighter }) {
  const patchFighter = useStudioStore((s) => s.patchFighter);
  const lang = useStudioStore((s) => s.promptLang);
  const [pasted, setPasted] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function apply() {
    const result = parseWithSchema(pasted, fighterSheetSchema);
    if (!result.ok) {
      setMessage({ ok: false, text: result.error });
      return;
    }
    patchFighter(fighter.slot, result.data);
    setPasted('');
    setMessage({ ok: true, text: 'Ficha atualizada com a resposta do Gemini.' });
  }

  return (
    <details className="rounded-[4px] border border-line">
      <summary className="cursor-pointer px-3 py-2 text-sm text-ink">Completar a ficha com o Gemini</summary>
      <div className="flex flex-col gap-3 border-t border-line p-3">
        <p className="text-xs text-mute">
          Copie o prompt, cole no Gemini e traga a resposta de volta. Os campos abaixo serão preenchidos.
        </p>
        <div className="flex justify-end">
          <CopyButton text={buildSheetPrompt(fighter, lang)} label="Copiar prompt da ficha" />
        </div>
        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={5}
          placeholder="Cole aqui a resposta do Gemini"
          aria-label="Resposta do Gemini com a ficha"
          className="rounded-[4px] border border-line bg-base p-3 font-mono text-xs focus:border-playhead focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={apply}
            disabled={!pasted.trim()}
            className="rounded-[4px] bg-playhead px-3 py-1.5 text-xs font-semibold text-canvas disabled:opacity-40"
          >
            Aplicar ficha
          </button>
          {message && <span className={`text-xs ${message.ok ? 'text-mute' : 'text-act3'}`}>{message.text}</span>}
        </div>
      </div>
    </details>
  );
}
