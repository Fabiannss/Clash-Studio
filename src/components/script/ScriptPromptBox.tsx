'use client';

import { useMemo, useState } from 'react';
import { scriptSchema } from '@/domain/schemas';
import { STYLES } from '@/domain/styles';
import type { Fighter } from '@/domain/types';
import { parseWithSchema } from '@/services/parsing/extractJson';
import { buildScriptPrompt } from '@/services/prompts/scriptPrompt';
import { buildScript } from '@/services/script/buildScript';
import { templateScript } from '@/services/script/templateScript';
import { useStudioStore } from '@/store/useStudioStore';
import { CopyButton } from '../ui/CopyButton';
import { PromptLanguageSelector } from './PromptLanguageSelector';
import { StyleSelector } from './StyleSelector';

/** Fluxo manual do roteiro: copiar o prompt mestre, colar a resposta do Gemini. */
export function ScriptPromptBox({ a, b }: { a: Fighter; b: Fighter }) {
  const setScript = useStudioStore((s) => s.setScript);
  const styleId = useStudioStore((s) => s.style);
  const style = STYLES[styleId];
  const lang = useStudioStore((s) => s.promptLang);
  const prompt = useMemo(() => buildScriptPrompt(a, b, style, lang), [a, b, style, lang]);
  const [pasted, setPasted] = useState('');
  const [error, setError] = useState<string | null>(null);

  function applyPasted() {
    const result = parseWithSchema(pasted, scriptSchema);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setScript(buildScript(result.data));
    setPasted('');
  }

  function useTemplate() {
    setError(null);
    setScript(buildScript(templateScript(a, b, style, lang)));
  }

  return (
    <div className="flex flex-col gap-4 rounded-[4px] bg-surface p-5">
      <div>
        <h2 className="text-lg font-extrabold">Gerar o roteiro com o Gemini</h2>
        <p className="mt-1 max-w-prose text-sm text-mute">
          Copie o prompt, cole no Gemini e traga a resposta de volta. O app confere o formato antes de aceitar.
        </p>
      </div>

      <StyleSelector />
      <PromptLanguageSelector />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-mute">Prompt mestre</span>
          <CopyButton text={prompt} label="Copiar prompt mestre" />
        </div>
        <textarea
          readOnly
          value={prompt}
          rows={8}
          aria-label="Prompt mestre do roteiro"
          className="rounded-[4px] border border-line bg-base p-3 font-mono text-xs leading-relaxed text-mute"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="script-reply" className="text-xs text-mute">
          Resposta do Gemini
        </label>
        <textarea
          id="script-reply"
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={6}
          placeholder="Cole aqui o JSON que o Gemini devolveu"
          className="rounded-[4px] border border-line bg-base p-3 font-mono text-xs focus:border-playhead focus:outline-none"
        />
        {error && <p className="text-sm text-act3">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={applyPasted}
          disabled={!pasted.trim()}
          className="rounded-[4px] bg-playhead px-4 py-2 text-sm font-semibold text-canvas disabled:opacity-40"
        >
          Aplicar roteiro
        </button>
        <button
          type="button"
          onClick={useTemplate}
          className="rounded-[4px] border border-line px-4 py-2 text-sm text-ink hover:border-mute"
        >
          Usar roteiro de modelo
        </button>
      </div>
    </div>
  );
}
