'use client';

import { useState } from 'react';
import { publishSchema } from '@/domain/schemas';
import { downloadUrl } from '@/lib/download';
import { parseWithSchema } from '@/services/parsing/extractJson';
import { buildPublishPrompt } from '@/services/prompts/publishPrompt';
import { useStudioStore } from '@/store/useStudioStore';
import { PublishResults } from '../publish/PublishResults';
import { CopyButton } from '../ui/CopyButton';

export function PublishStep() {
  const a = useStudioStore((s) => s.fighters.A);
  const b = useStudioStore((s) => s.fighters.B);
  const script = useStudioStore((s) => s.script);
  const finalUrl = useStudioStore((s) => s.render.finalUrl);
  const publish = useStudioStore((s) => s.publish);
  const setPublish = useStudioStore((s) => s.setPublish);
  const [pasted, setPasted] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!a || !b || !script) {
    return <p className="text-sm text-mute">Escolha os lutadores e monte o roteiro antes de preparar a publicação.</p>;
  }

  function apply() {
    const result = parseWithSchema(pasted, publishSchema);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setPublish(result.data);
    setPasted('');
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Export Hub</h1>
          <p className="mt-1 max-w-prose text-sm text-mute">
            Baixe o vídeo e gere títulos, descrições e tags para YouTube e TikTok.
          </p>
        </div>
        {finalUrl ? (
          <button
            type="button"
            onClick={() => downloadUrl(finalUrl, 'clash-studio-batalha.mp4')}
            className="rounded-[4px] bg-playhead px-5 py-2.5 text-sm font-semibold text-canvas"
          >
            Baixar MP4
          </button>
        ) : (
          <p className="text-xs text-mute">O vídeo ainda não foi montado.</p>
        )}
      </header>

      <div className="flex flex-col gap-3 rounded-[4px] bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Textos de publicação com o Gemini</h2>
          <CopyButton text={buildPublishPrompt(a, b, script.setting)} label="Copiar prompt" />
        </div>
        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={5}
          placeholder="Cole aqui o JSON que o Gemini devolveu"
          aria-label="Resposta do Gemini com os textos de publicação"
          className="rounded-[4px] border border-line bg-base p-3 font-mono text-xs focus:border-playhead focus:outline-none"
        />
        {error && <p className="text-sm text-act3">{error}</p>}
        <div>
          <button
            type="button"
            onClick={apply}
            disabled={!pasted.trim()}
            className="rounded-[4px] bg-playhead px-4 py-2 text-sm font-semibold text-canvas disabled:opacity-40"
          >
            Aplicar textos
          </button>
        </div>
      </div>

      {publish && <PublishResults copy={publish} />}
    </div>
  );
}
