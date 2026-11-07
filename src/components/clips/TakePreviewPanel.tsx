'use client';

import { useEffect, useRef } from 'react';
import { BEAT_SECONDS, TAKE_PLAN } from '@/domain/constants';
import { takeFiles, useTakePreview } from '@/hooks/useTakePreview';
import { takeSignature } from '@/lib/takeSignature';
import { useStudioStore } from '@/store/useStudioStore';
import { actAccent } from '../ui/accents';

/** Player do take juntado (3 clipes em 1 vídeo de 20s). Aparece quando o usuário pede a prévia. */
export function TakePreviewPanel() {
  const preview = useStudioStore((s) => s.takePreview);
  const clips = useStudioStore((s) => s.clips);
  const renderRunning = useStudioStore((s) => s.render.status === 'running');
  const close = useStudioStore((s) => s.resetTakePreview);
  const build = useTakePreview();
  const ref = useRef<HTMLElement>(null);

  const active = preview.take !== null && preview.status !== 'idle';

  // Leva a tela até o player quando a prévia começa.
  useEffect(() => {
    if (preview.status === 'running') ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [preview.status, preview.take]);

  if (!active || preview.take === null) return null;

  const take = preview.take;
  const accent = actAccent[take];
  const title = TAKE_PLAN[take - 1].title;
  // `clips` está assinado acima: a tela reavalia quando algum arquivo é trocado.
  const files = clips ? takeFiles(take) : null;
  const stale = preview.status === 'done' && (!files || takeSignature(files) !== preview.signature);
  const seconds = BEAT_SECONDS.reduce((sum, s) => sum + s, 0);

  return (
    <section ref={ref} className="flex flex-col gap-3 rounded-[4px] border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`text-lg font-extrabold ${accent.text}`}>
          Take {take} juntado · {title}
          <span className="ml-3 font-mono text-xs font-normal text-mute">{seconds}s</span>
        </h2>
        <button
          type="button"
          onClick={close}
          disabled={preview.status === 'running'}
          className="rounded-[4px] border border-line px-3 py-1.5 text-xs text-mute hover:border-mute hover:text-ink disabled:opacity-40"
        >
          Fechar
        </button>
      </div>

      {preview.status === 'running' && (
        <div className="flex flex-col gap-1" role="status" aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-base">
            <div
              className="h-full bg-playhead transition-[width]"
              style={{ width: `${Math.round(preview.progress * 100)}%` }}
            />
          </div>
          <p className="font-mono text-xs text-mute">
            {preview.stage} · {Math.round(preview.progress * 100)}%
          </p>
        </div>
      )}

      {preview.status === 'error' && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-act3" role="alert">
            {preview.error}
          </p>
          <div>
            <button
              type="button"
              onClick={() => build(take)}
              disabled={renderRunning}
              className="rounded-[4px] bg-playhead px-3 py-1.5 text-xs font-semibold text-canvas disabled:opacity-40"
            >
              Tentar de novo
            </button>
          </div>
        </div>
      )}

      {preview.status === 'done' && preview.url && (
        <>
          <video
            key={preview.url}
            src={preview.url}
            controls
            autoPlay
            playsInline
            className="aspect-video w-full rounded-[4px] bg-base"
          />
          {stale && (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs text-act2">Os clipes deste take mudaram depois da junção.</p>
              <button
                type="button"
                onClick={() => build(take)}
                disabled={renderRunning || !files}
                className="rounded-[4px] bg-playhead px-3 py-1.5 text-xs font-semibold text-canvas disabled:opacity-40"
              >
                Juntar de novo
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
