'use client';

import { allClipKeys, clipId } from '@/domain/clips';
import { useRender } from '@/hooks/useRender';
import { useStudioStore } from '@/store/useStudioStore';
import { MusicOptions } from '../render/MusicOptions';
import { PreviewPlayer } from '../render/PreviewPlayer';

export function RenderStep() {
  const clips = useStudioStore((s) => s.clips);
  const render = useStudioStore((s) => s.render);
  const setStep = useStudioStore((s) => s.setStep);
  const startRender = useRender();

  const ready = allClipKeys().every((k) => clips[clipId(k)]);
  const previewBusy = useStudioStore((s) => s.takePreview.status === 'running');
  const running = render.status === 'running';

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Montagem do vídeo</h1>
        <p className="mt-1 max-w-prose text-sm text-mute">
          Tudo roda no seu navegador: os clipes são padronizados, unidos com crossfade entre os takes e
          recebem a trilha. Mantenha esta aba aberta durante a montagem, que pode levar alguns minutos.
        </p>
      </header>

      {!ready && (
        <p className="text-sm text-act2">
          Faltam clipes. Volte à etapa de clipes e envie os 9 arquivos antes de montar.
        </p>
      )}

      <MusicOptions />

      <div className="flex flex-col gap-3 rounded-[4px] bg-surface p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={startRender}
            disabled={!ready || running || previewBusy}
            className="rounded-[4px] bg-playhead px-5 py-2.5 text-sm font-semibold text-canvas disabled:opacity-40"
          >
            {running ? 'Montando…' : render.status === 'done' ? 'Montar de novo' : 'Montar vídeo de 60s'}
          </button>
          {render.status === 'done' && (
            <button
              type="button"
              onClick={() => setStep('publish')}
              className="rounded-[4px] border border-line px-4 py-2 text-sm hover:border-mute"
            >
              Ir para a publicação
            </button>
          )}
        </div>

        {running && (
          <div className="flex flex-col gap-1" role="status" aria-live="polite">
            <div className="h-2 overflow-hidden rounded-full bg-base">
              <div
                className="h-full bg-playhead transition-[width]"
                style={{ width: `${Math.round(render.progress * 100)}%` }}
              />
            </div>
            <p className="font-mono text-xs text-mute">
              {render.stage} · {Math.round(render.progress * 100)}%
            </p>
          </div>
        )}

        {render.status === 'error' && (
          <p className="text-sm text-act3" role="alert">
            {render.error}
          </p>
        )}
      </div>

      {render.status === 'done' && <PreviewPlayer />}
    </div>
  );
}
