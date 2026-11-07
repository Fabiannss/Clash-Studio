'use client';

import { allClipKeys, clipId } from '@/domain/clips';
import { useStudioStore, type StepId } from '@/store/useStudioStore';

interface StepInfo {
  id: StepId;
  label: string;
  enabled: boolean;
  status: string;
}

/** Navegação lateral (topo no celular) com o andamento de cada etapa. */
export function StepNav() {
  const step = useStudioStore((s) => s.step);
  const setStep = useStudioStore((s) => s.setStep);
  const fighters = useStudioStore((s) => s.fighters);
  const script = useStudioStore((s) => s.script);
  const clips = useStudioStore((s) => s.clips);
  const render = useStudioStore((s) => s.render);
  const publish = useStudioStore((s) => s.publish);

  const hasFighters = Boolean(fighters.A && fighters.B);
  const clipCount = allClipKeys().filter((k) => clips[clipId(k)]).length;

  const steps: StepInfo[] = [
    { id: 'fighters', label: 'Lutadores', enabled: true, status: hasFighters ? 'Prontos' : 'Escolher' },
    { id: 'script', label: 'Roteiro', enabled: hasFighters, status: script ? 'Pronto' : 'Pendente' },
    { id: 'clips', label: 'Clipes', enabled: Boolean(script), status: `${clipCount}/9` },
    {
      id: 'render',
      label: 'Montagem',
      enabled: Boolean(script),
      status: render.status === 'done' ? 'Pronta' : render.status === 'running' ? 'Montando' : 'Pendente',
    },
    { id: 'publish', label: 'Publicar', enabled: Boolean(script), status: publish ? 'Pronto' : 'Pendente' },
  ];

  return (
    <nav aria-label="Etapas" className="shrink-0 border-b border-line md:w-52 md:border-b-0 md:border-r">
      <ol className="flex overflow-x-auto md:flex-col md:py-3">
        {steps.map((s, i) => {
          const active = step === s.id;
          return (
            <li key={s.id} className="shrink-0">
              <button
                type="button"
                disabled={!s.enabled}
                aria-current={active ? 'step' : undefined}
                onClick={() => setStep(s.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm disabled:opacity-35 md:px-5 ${
                  active ? 'bg-raised text-ink' : 'text-mute hover:text-ink'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${
                    active ? 'border-playhead text-playhead' : 'border-line'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex flex-col">
                  <span className="font-semibold">{s.label}</span>
                  <span className="font-mono text-[11px] text-mute">{s.status}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
