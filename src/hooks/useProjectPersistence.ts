'use client';

import { useEffect, useState } from 'react';
import type { TakeIndex } from '@/domain/types';
import { loadAllMedia } from '@/lib/storage/mediaDb';
import { MUSIC_ID, syncMedia } from '@/lib/storage/syncMedia';
import { useStudioStore } from '@/store/useStudioStore';

/**
 * Restaura o projeto salvo (textos do localStorage, vídeos e música do IndexedDB)
 * e passa a salvar as mudanças dos arquivos. Só começa a salvar depois de
 * restaurar, para não apagar o que já estava guardado.
 */
export function useProjectPersistence() {
  const [ready, setReady] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    async function start() {
      await useStudioStore.persist.rehydrate();

      let rows: { id: string; file: File }[] = [];
      try {
        rows = await loadAllMedia();
      } catch {
        setMediaError(true);
      }
      if (cancelled) return;

      const items = rows
        .filter((row) => row.id.startsWith('clip:'))
        .map((row) => {
          const [take, beat] = row.id.slice('clip:'.length).split('-').map(Number);
          return { key: { take: take as TakeIndex, beat }, file: row.file };
        });
      const music = rows.find((row) => row.id === MUSIC_ID)?.file ?? null;
      useStudioStore.getState().hydrateMedia(items, music);

      unsubscribe = useStudioStore.subscribe((state, prev) => syncMedia(state, prev, () => setMediaError(true)));
      setReady(true);
    }

    void start();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return { ready, mediaError };
}
