'use client';

import { useStudioStore } from '@/store/useStudioStore';
import { ExportPrompts } from '../script/ExportPrompts';
import { ScriptPromptBox } from '../script/ScriptPromptBox';
import { TakeEditor } from '../script/TakeEditor';
import { TextField } from '../ui/Fields';

export function ScriptStep() {
  const a = useStudioStore((s) => s.fighters.A);
  const b = useStudioStore((s) => s.fighters.B);
  const script = useStudioStore((s) => s.script);
  const setScript = useStudioStore((s) => s.setScript);
  const patchSetting = useStudioStore((s) => s.patchScriptSetting);
  const setStep = useStudioStore((s) => s.setStep);

  if (!a || !b) {
    return <p className="text-sm text-mute">Escolha os dois lutadores antes de montar o roteiro.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Roteiro em três atos</h1>
        <p className="mt-1 max-w-prose text-sm text-mute">
          {a.name} contra {b.name}: 60 segundos divididos em 3 takes de 20s. Cada take vira 3 sub-clipes para
          gerar no Flow.
        </p>
      </header>

      {script ? (
        <>
          <TextField label="Cenário da batalha" value={script.setting} onChange={patchSetting} />
          <ExportPrompts />
          {script.takes.map((take) => (
            <TakeEditor key={take.index} take={take} />
          ))}
          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() => setScript(null)}
              className="rounded-[4px] border border-line px-4 py-2 text-sm text-mute hover:border-mute hover:text-ink"
            >
              Descartar roteiro e refazer
            </button>
            <button
              type="button"
              onClick={() => setStep('clips')}
              className="rounded-[4px] bg-playhead px-5 py-2.5 text-sm font-semibold text-canvas"
            >
              Ir para os clipes
            </button>
          </div>
        </>
      ) : (
        <ScriptPromptBox a={a} b={b} />
      )}
    </div>
  );
}
