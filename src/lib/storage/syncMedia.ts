import type { useStudioStore } from '@/store/useStudioStore';
import { deleteMedia, saveMedia } from './mediaDb';

type StudioState = ReturnType<typeof useStudioStore.getState>;

export const MUSIC_ID = 'music';
export const clipStorageId = (clipId: string): string => `clip:${clipId}`;

/** Compara o estado novo com o anterior e grava ou apaga só o que mudou. */
export function syncMedia(next: StudioState, prev: StudioState, onError: () => void): void {
  for (const [id, clip] of Object.entries(next.clips)) {
    if (prev.clips[id]?.file !== clip.file) {
      void saveMedia(clipStorageId(id), clip.file).catch(onError);
    }
  }
  for (const id of Object.keys(prev.clips)) {
    if (!next.clips[id]) void deleteMedia(clipStorageId(id)).catch(onError);
  }
  if (next.music !== prev.music) {
    const job: Promise<unknown> = next.music ? saveMedia(MUSIC_ID, next.music) : deleteMedia(MUSIC_ID);
    void job.catch(onError);
  }
}
