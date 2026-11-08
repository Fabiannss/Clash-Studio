'use client';

import { useCallback } from 'react';
import { makeFxPlanner } from '@/lib/ffmpeg/fxPlan';
import { renderBattle } from '@/lib/ffmpeg/render';
import { useStudioStore } from '@/store/useStudioStore';

/** Dispara a montagem do vídeo e traduz o andamento para o estado da tela. */
export function useRender() {
  return useCallback(async () => {
    const state = useStudioStore.getState();
    state.resetRender();
    state.setRender({ status: 'running', stage: 'Carregando o FFmpeg', progress: 0 });

    try {
      const clips = new Map<string, File>(Object.entries(state.clips).map(([id, c]) => [id, c.file]));
      const result = await renderBattle({
        clips,
        music: state.music,
        keepClipAudio: state.keepClipAudio,
        fxFor: makeFxPlanner(state.fx, state.focus),
        onProgress: (stage, progress) => useStudioStore.getState().setRender({ stage, progress }),
      });

      useStudioStore.getState().setRender({
        status: 'done',
        stage: 'Pronto',
        progress: 1,
        finalUrl: URL.createObjectURL(result.final),
        takeUrls: result.takes.map((blob) => URL.createObjectURL(blob)),
      });
      useStudioStore.getState().setPreview('final');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido na montagem.';
      useStudioStore.getState().setRender({ status: 'error', error: message });
    }
  }, []);
}
