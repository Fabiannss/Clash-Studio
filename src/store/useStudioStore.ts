import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { sanitizeScript } from '@/services/script/sanitizeScript';
import { clipId } from '@/domain/clips';
import type { CameraId } from '@/domain/cameras';
import type { StyleId } from '@/domain/styles';
import type { PromptLang } from '@/domain/lang';
import { DEFAULT_FX, type FocusChoice, type FxSettings } from '@/domain/fx';
import type {
  BattleScript,
  ClipKey,
  Fighter,
  FighterSlot,
  PublishCopy,
  Take,
  TakeIndex,
  UploadedClip,
} from '@/domain/types';

export type StepId = 'fighters' | 'script' | 'clips' | 'render' | 'publish';
export type PreviewTarget = 'final' | TakeIndex;

export interface RenderState {
  status: 'idle' | 'running' | 'done' | 'error';
  stage: string;
  progress: number;
  finalUrl?: string;
  takeUrls: string[];
  error?: string;
}

const idleRender: RenderState = { status: 'idle', stage: '', progress: 0, takeUrls: [] };

/** Prévia de um take isolado (3 clipes juntos), antes da montagem de 60s. */
export interface TakePreviewState {
  take: TakeIndex | null;
  status: 'idle' | 'running' | 'done' | 'error';
  stage: string;
  progress: number;
  url?: string;
  /** Assinatura dos clipes usados, para detectar se mudaram depois. */
  signature?: string;
  error?: string;
}

const idleTakePreview: TakePreviewState = { take: null, status: 'idle', stage: '', progress: 0 };

interface StudioState {
  step: StepId;
  style: StyleId;
  promptLang: PromptLang;
  fighters: Record<FighterSlot, Fighter | null>;
  script: BattleScript | null;
  clips: Record<string, UploadedClip>;
  music: File | null;
  keepClipAudio: boolean;
  fx: FxSettings;
  /** Lutador em foco por clipe (id "take-beat"). Sem registro, vale o padrão alternado. */
  focus: Record<string, FocusChoice>;
  render: RenderState;
  takePreview: TakePreviewState;
  preview: PreviewTarget;
  playhead: number;
  publish: PublishCopy | null;

  setStep: (step: StepId) => void;
  setStyle: (style: StyleId) => void;
  setPromptLang: (lang: PromptLang) => void;
  setFighter: (slot: FighterSlot, fighter: Fighter | null) => void;
  patchFighter: (slot: FighterSlot, patch: Partial<Fighter>) => void;
  setScript: (script: BattleScript | null) => void;
  patchScriptSetting: (setting: string) => void;
  patchTake: (index: TakeIndex, patch: Partial<Take>) => void;
  patchBeat: (index: TakeIndex, order: number, prompt: string) => void;
  patchBeatCamera: (index: TakeIndex, order: number, camera: CameraId) => void;
  setClip: (key: ClipKey, file: File) => void;
  removeClip: (key: ClipKey) => void;
  setMusic: (file: File | null) => void;
  setKeepClipAudio: (value: boolean) => void;
  setFx: (patch: Partial<FxSettings>) => void;
  setFocus: (key: ClipKey, choice: FocusChoice) => void;
  setRender: (patch: Partial<RenderState>) => void;
  resetRender: () => void;
  setTakePreview: (patch: Partial<TakePreviewState>) => void;
  resetTakePreview: () => void;
  setPreview: (target: PreviewTarget) => void;
  setPlayhead: (seconds: number) => void;
  setPublish: (copy: PublishCopy | null) => void;
  /** Volta ao estado inicial (novo projeto). */
  resetAll: () => void;
  /** Coloca no estado os arquivos restaurados do navegador. */
  hydrateMedia: (items: { key: ClipKey; file: File }[], music: File | null) => void;
}

function revokeRender(render: RenderState) {
  if (render.finalUrl) URL.revokeObjectURL(render.finalUrl);
  render.takeUrls.forEach((url) => URL.revokeObjectURL(url));
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
  step: 'fighters',
  style: 'live-action',
  promptLang: 'pt',
  fighters: { A: null, B: null },
  script: null,
  clips: {},
  music: null,
  keepClipAudio: true,
  fx: DEFAULT_FX,
  focus: {},
  render: idleRender,
  takePreview: idleTakePreview,
  preview: 'final',
  playhead: 0,
  publish: null,

  setStep: (step) => set({ step }),
  setStyle: (style) => set({ style }),
  setPromptLang: (promptLang) => set({ promptLang }),

  setFighter: (slot, fighter) => set((s) => ({ fighters: { ...s.fighters, [slot]: fighter } })),

  patchFighter: (slot, patch) =>
    set((s) => {
      const current = s.fighters[slot];
      return current ? { fighters: { ...s.fighters, [slot]: { ...current, ...patch } } } : s;
    }),

  setScript: (script) => set({ script }),

  patchScriptSetting: (setting) =>
    set((s) => (s.script ? { script: { ...s.script, setting } } : s)),

  patchTake: (index, patch) =>
    set((s) =>
      s.script
        ? { script: { ...s.script, takes: s.script.takes.map((t) => (t.index === index ? { ...t, ...patch } : t)) } }
        : s,
    ),

  patchBeat: (index, order, prompt) =>
    set((s) =>
      s.script
        ? {
            script: {
              ...s.script,
              takes: s.script.takes.map((t) =>
                t.index === index
                  ? { ...t, beats: t.beats.map((b) => (b.order === order ? { ...b, prompt } : b)) }
                  : t,
              ),
            },
          }
        : s,
    ),

  patchBeatCamera: (index, order, camera) =>
    set((s) =>
      s.script
        ? {
            script: {
              ...s.script,
              takes: s.script.takes.map((t) =>
                t.index === index
                  ? { ...t, beats: t.beats.map((b) => (b.order === order ? { ...b, camera } : b)) }
                  : t,
              ),
            },
          }
        : s,
    ),

  setClip: (key, file) => {
    const id = clipId(key);
    const previous = get().clips[id];
    if (previous) URL.revokeObjectURL(previous.previewUrl);
    const clip: UploadedClip = { key, fileName: file.name, file, previewUrl: URL.createObjectURL(file) };
    set((s) => ({ clips: { ...s.clips, [id]: clip } }));
  },

  removeClip: (key) => {
    const id = clipId(key);
    const previous = get().clips[id];
    if (previous) URL.revokeObjectURL(previous.previewUrl);
    set((s) => {
      const { [id]: _removed, ...rest } = s.clips;
      return { clips: rest };
    });
  },

  setMusic: (music) => set({ music }),
  setKeepClipAudio: (keepClipAudio) => set({ keepClipAudio }),
  setFx: (patch) => set((s) => ({ fx: { ...s.fx, ...patch } })),
  setFocus: (key, choice) => set((s) => ({ focus: { ...s.focus, [clipId(key)]: choice } })),

  setRender: (patch) => set((s) => ({ render: { ...s.render, ...patch } })),
  resetRender: () => {
    revokeRender(get().render);
    set({ render: idleRender, playhead: 0, preview: 'final' });
  },

  setTakePreview: (patch) => set((s) => ({ takePreview: { ...s.takePreview, ...patch } })),
  resetTakePreview: () => {
    const { url } = get().takePreview;
    if (url) URL.revokeObjectURL(url);
    set({ takePreview: idleTakePreview });
  },

  setPreview: (preview) => set({ preview }),
  setPlayhead: (playhead) => set({ playhead }),
  setPublish: (publish) => set({ publish }),

  resetAll: () => {
    const { clips, render, takePreview } = get();
    Object.values(clips).forEach((clip) => URL.revokeObjectURL(clip.previewUrl));
    revokeRender(render);
    if (takePreview.url) URL.revokeObjectURL(takePreview.url);
    set({
      step: 'fighters',
      style: 'live-action',
      promptLang: 'pt',
      fighters: { A: null, B: null },
      script: null,
      clips: {},
      music: null,
      keepClipAudio: true,
      fx: DEFAULT_FX,
      focus: {},
      render: idleRender,
      takePreview: idleTakePreview,
      preview: 'final',
      playhead: 0,
      publish: null,
    });
  },

  hydrateMedia: (items, music) => {
    const clips: Record<string, UploadedClip> = {};
    for (const { key, file } of items) {
      clips[clipId(key)] = { key, fileName: file.name, file, previewUrl: URL.createObjectURL(file) };
    }
    set({ clips, music });
  },
    }),
    {
      name: 'clash-studio-project',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // A restauração é feita por useProjectPersistence, depois da primeira renderização.
      skipHydration: true,
      // Só dados leves: os arquivos de vídeo e áudio vão para o IndexedDB.
      partialize: (s) => ({
        step: s.step,
        style: s.style,
        promptLang: s.promptLang,
        fighters: s.fighters,
        script: s.script,
        keepClipAudio: s.keepClipAudio,
        fx: s.fx,
        focus: s.focus,
        publish: s.publish,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<StudioState>;
        return {
          ...current,
          ...saved,
          fx: { ...DEFAULT_FX, ...(saved.fx ?? {}) },
          focus: saved.focus ?? {},
          script: sanitizeScript(saved.script),
        };
      },
    },
  ),
);
