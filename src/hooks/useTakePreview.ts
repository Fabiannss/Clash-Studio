'use client';

import { useCallback } from 'react';
import { BEAT_SECONDS } from '@/domain/constants';
import { clipId } from '@/domain/clips';
import type { TakeIndex } from '@/domain/types';
import { fxSignature, makeFxPlanner } from '@/lib/ffmpeg/fxPlan';
import { renderTake } from '@/lib/ffmpeg/renderTake';
import { takeSignature } from '@/lib/takeSignature';
import { useStudioStore } from '@/store/useStudioStore';

/** Arquivos dos clipes de um take, ou null se ainda falta algum. */
export function takeFiles(take: TakeIndex): File[] | null {
  const { clips } = useStudioStore.getState();
  const files = BEAT_SECONDS.map((_s, i) => clips[clipId({ take, beat: i + 1 })]?.file);
  return files.every((f): f is File => Boolean(f)) ? files : null;
}

/** Muda quando um clipe do take, um efeito ou o foco muda: serve para saber se a prévia ficou velha. */
export function previewSignature(take: TakeIndex): string | null {
  const files = takeFiles(take);
  if (!files) return null;
  const { fx, focus } = useStudioStore.getState();
  return `${takeSignature(files)}#${fxSignature(fx, focus)}`;
}

/** Junta os 3 clipes de um take e guarda o resultado para o player. */
export function useTakePreview() {
  return useCallback(async (take: TakeIndex) => {
    const state = useStudioStore.getState();
    if (state.render.status === 'running' || state.takePreview.status === 'running') return;

    const files = takeFiles(take);
    if (!files) return;

    const signature = previewSignature(take)!;
    const planner = makeFxPlanner(state.fx, state.focus);
    const current = state.takePreview;
    if (current.take === take && current.status === 'done' && current.signature === signature) return;

    state.resetTakePreview();
    useStudioStore
      .getState()
      .setTakePreview({ take, status: 'running', stage: 'Carregando o FFmpeg', progress: 0, signature });

    try {
      const blob = await renderTake({
        clips: files,
        fxFor: (beat, seconds) => planner(take, beat, seconds),
        onProgress: (stage, progress) => useStudioStore.getState().setTakePreview({ stage, progress }),
      });
      useStudioStore.getState().setTakePreview({
        status: 'done',
        stage: 'Pronto',
        progress: 1,
        url: URL.createObjectURL(blob),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido ao juntar os clipes.';
      useStudioStore.getState().setTakePreview({ status: 'error', error: message });
    }
  }, []);
}
