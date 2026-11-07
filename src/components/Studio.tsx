'use client';

import { useProjectPersistence } from '@/hooks/useProjectPersistence';
import { useStudioStore } from '@/store/useStudioStore';
import { StepNav } from './nav/StepNav';
import { ClipsStep } from './steps/ClipsStep';
import { FightersStep } from './steps/FightersStep';
import { PublishStep } from './steps/PublishStep';
import { RenderStep } from './steps/RenderStep';
import { ScriptStep } from './steps/ScriptStep';
import { Timeline } from './timeline/Timeline';
import { VersusHeader } from './nav/VersusHeader';

const STEP_VIEWS = {
  fighters: FightersStep,
  script: ScriptStep,
  clips: ClipsStep,
  render: RenderStep,
  publish: PublishStep,
} as const;

/** Estúdio: cabeçalho, etapas à esquerda, conteúdo e timeline fixa embaixo. */
export function Studio() {
  const step = useStudioStore((s) => s.step);
  const View = STEP_VIEWS[step];
  const { ready, mediaError } = useProjectPersistence();

  return (
    <div className="flex h-dvh flex-col">
      <VersusHeader />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <StepNav />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-5xl">
            {mediaError && (
              <p role="alert" className="mb-4 rounded-[4px] border border-act2 p-3 text-sm text-act2">
                Não consegui salvar os vídeos neste navegador (janela anônima ou sem espaço). Os textos continuam
                salvos, mas os clipes precisarão ser enviados de novo se você fechar a página.
              </p>
            )}
            {ready ? <View /> : <p className="text-sm text-mute">Carregando o projeto…</p>}
          </div>
        </main>
      </div>
      <Timeline />
    </div>
  );
}
