'use client';

import { allClipKeys, clipId } from '@/domain/clips';
import type { TakeIndex } from '@/domain/types';
import { formatRange } from '@/lib/timecode';
import { useStudioStore } from '@/store/useStudioStore';
import { BEAT_SECONDS } from '@/domain/constants';
import { useTakePreview } from '@/hooks/useTakePreview';
import { ClipSlot } from '../clips/ClipSlot';
import { TakePreviewPanel } from '../clips/TakePreviewPanel';
import { ExportPrompts } from '../script/ExportPrompts';
import { actAccent } from '../ui/accents';

export function ClipsStep() {
  const script = useStudioStore((s) => s.script);
  const clips = useStudioStore((s) => s.clips);
  const setStep = useStudioStore((s) => s.setStep);
  const busy = useStudioStore((s) => s.render.status === 'running' || s.takePreview.status === 'running');
  const buildTakePreview = useTakePreview();

  if (!script) {
    return <p className="text-sm text-mute">Monte o roteiro antes de enviar os clipes.</p>;
  }

  const total = allClipKeys().length;
  const done = allClipKeys().filter((k) => clips[clipId(k)]).length;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Clipes do Flow</h1>
        <p className="mt-1 max-w-prose text-sm text-mute">
          Cada take tem 3 vídeos de 8s, 8s e 4s, que somam 20s. Para cada clipe: copie o prompt, gere no Flow, baixe o MP4 e envie aqui. O terceiro clipe aproveita só 4s: se o Flow não oferecer essa duração, gere 8s e o app corta. Para manter a cena
          contínua, baixe o quadro final de um clipe e use-o como imagem inicial do próximo no Flow.
        </p>
        <p className="mt-2 font-mono text-sm text-playhead">
          {done} de {total} clipes enviados
        </p>
        <div className="mt-3">
          <ExportPrompts />
        </div>
      </header>

      <TakePreviewPanel />

      {script.takes.map((take) => {
        const accent = actAccent[take.index as TakeIndex];
        const takeReady = BEAT_SECONDS.every((_s, i) => clips[clipId({ take: take.index as TakeIndex, beat: i + 1 })]);
        return (
          <section key={take.index} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-baseline gap-3 text-lg font-extrabold">
                <span className={`inline-block h-3 w-3 rounded-full ${accent.bg}`} aria-hidden />
                Take {take.index}: {take.title}
                <span className="font-mono text-xs font-normal text-mute">
                  {formatRange(take.startSec, take.endSec)}
                </span>
              </h2>
              <button
                type="button"
                onClick={() => buildTakePreview(take.index as TakeIndex)}
                disabled={!takeReady || busy}
                title={takeReady ? 'Junta os 3 clipes deste take e toca' : 'Envie os 3 clipes deste take primeiro'}
                className="rounded-[4px] border border-line bg-raised px-3 py-1.5 text-xs font-semibold text-ink hover:border-mute disabled:opacity-40"
              >
                Juntar os 3 clipes e assistir
              </button>
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              {take.beats.map((beat) => (
                <ClipSlot key={beat.order} clipKey={{ take: take.index, beat: beat.order }} beat={beat} />
              ))}
            </div>
          </section>
        );
      })}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={done < total}
          onClick={() => setStep('render')}
          className="rounded-[4px] bg-playhead px-5 py-2.5 text-sm font-semibold text-canvas disabled:opacity-40"
        >
          Ir para a montagem
        </button>
      </div>
    </div>
  );
}
