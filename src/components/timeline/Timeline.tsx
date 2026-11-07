'use client';

import { clipId } from '@/domain/clips';
import { BEAT_SECONDS, TAKE_PLAN, TOTAL_SECONDS } from '@/domain/constants';
import type { TakeIndex } from '@/domain/types';
import { takeFiles, useTakePreview } from '@/hooks/useTakePreview';
import { formatTimecode } from '@/lib/timecode';
import { useStudioStore } from '@/store/useStudioStore';
import { actAccent } from '../ui/accents';

const TICKS = [0, 10, 20, 30, 40, 50, 60];

/**
 * Linha do tempo permanente: 3 atos de 20s, cada um com 3 sub-clipes
 * proporcionais (8s, 8s, 4s). A agulha acompanha o player.
 */
export function Timeline() {
  const clips = useStudioStore((s) => s.clips);
  const playhead = useStudioStore((s) => s.playhead);
  const renderDone = useStudioStore((s) => s.render.status === 'done');
  const setStep = useStudioStore((s) => s.setStep);
  const setPreview = useStudioStore((s) => s.setPreview);
  const buildTakePreview = useTakePreview();

  const playheadPct = Math.min(100, Math.max(0, (playhead / TOTAL_SECONDS) * 100));

  function openTake(take: TakeIndex) {
    if (renderDone) {
      setPreview(take);
      setStep('render');
      return;
    }
    // Sem a montagem final: se os 3 clipes do take existem, junta e toca na etapa Clipes.
    setStep('clips');
    if (takeFiles(take)) void buildTakePreview(take);
  }

  return (
    <div className="border-t border-line bg-surface px-4 pb-3 pt-2 md:px-6">
      <div className="relative">
        <div className="relative h-5 font-mono text-[11px] text-mute" aria-hidden>
          {TICKS.map((s) => (
            <span
              key={s}
              className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
              style={{ left: `${(s / TOTAL_SECONDS) * 100}%` }}
            >
              {formatTimecode(s)}
            </span>
          ))}
        </div>

        <div className="flex h-14 border border-line">
          {TAKE_PLAN.map((plan) => {
            const take = plan.index as TakeIndex;
            const accent = actAccent[take];
            return (
              <div key={take} className="flex flex-1 flex-col border-r border-line last:border-r-0">
                <button
                  type="button"
                  onClick={() => openTake(take)}
                  className={`truncate px-2 text-left text-[11px] font-semibold ${accent.text} hover:bg-raised`}
                  title={`${plan.goal} Clique para juntar os 3 clipes e assistir.`}
                >
                  Take {take} · {plan.title}
                </button>
                <div className="flex min-h-0 flex-1">
                  {BEAT_SECONDS.map((seconds, i) => {
                    const filled = Boolean(clips[clipId({ take, beat: i + 1 })]);
                    return (
                      <button
                        key={i}
                        type="button"
                        style={{ flexGrow: seconds }}
                        onClick={() => setStep('clips')}
                        aria-label={`Clipe ${take}.${i + 1}, ${filled ? 'enviado' : 'pendente'}`}
                        className={`flex basis-0 items-center justify-center border-l border-line font-mono text-[11px] first:border-l-0 ${
                          filled ? `${accent.dim} ${accent.text}` : 'text-mute hover:bg-raised'
                        }`}
                      >
                        {take}.{i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute bottom-0 top-0 w-px bg-playhead"
          style={{ left: `${playheadPct}%` }}
          aria-hidden
        >
          <span className="absolute -left-[4px] top-0 h-2 w-[9px] bg-playhead [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        </div>
      </div>
    </div>
  );
}
