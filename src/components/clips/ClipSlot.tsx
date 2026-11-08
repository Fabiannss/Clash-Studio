'use client';

import { useRef, useState } from 'react';
import { clipId, allClipKeys } from '@/domain/clips';
import type { Beat, ClipKey } from '@/domain/types';
import { downloadBlob } from '@/lib/download';
import { extractLastFrame } from '@/lib/ffmpeg/lastFrame';
import { composeClipPrompt } from '@/services/script/composeClipPrompt';
import { useStudioStore } from '@/store/useStudioStore';
import { CameraSelect } from '../script/CameraSelect';
import { FocusSelect } from './FocusSelect';
import { CopyButton } from '../ui/CopyButton';
import { actAccent } from '../ui/accents';

const LAST_KEY = allClipKeys().at(-1)!;

/** Um sub-clipe: prompt para copiar, quadro de continuidade e envio do MP4. */
export function ClipSlot({ clipKey, beat }: { clipKey: ClipKey; beat: Beat }) {
  const clip = useStudioStore((s) => s.clips[clipId(clipKey)]);
  const setClip = useStudioStore((s) => s.setClip);
  const removeClip = useStudioStore((s) => s.removeClip);
  const lang = useStudioStore((s) => s.promptLang);
  const promptText = composeClipPrompt(beat, lang);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [frameState, setFrameState] = useState<'idle' | 'working' | 'error'>('idle');
  const accent = actAccent[clipKey.take];
  const isLast = clipKey.take === LAST_KEY.take && clipKey.beat === LAST_KEY.beat;

  function accept(file: File | undefined) {
    if (file && file.type.startsWith('video/')) setClip(clipKey, file);
  }

  async function handleFrame() {
    if (!clip) return;
    setFrameState('working');
    try {
      const frame = await extractLastFrame(clip.file);
      downloadBlob(frame, `quadro-final-${clipKey.take}-${clipKey.beat}.jpg`);
      setFrameState('idle');
    } catch {
      setFrameState('error');
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[4px] border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className={`font-mono text-sm ${accent.text}`}>
          Clipe {clipKey.take}.{clipKey.beat} · {beat.seconds}s
        </h4>
        <CopyButton text={promptText} label="Copiar prompt" />
      </div>

      <CameraSelect take={clipKey.take} beat={beat} />
      <FocusSelect clipKey={clipKey} />

      <p className="font-mono text-xs leading-relaxed text-mute">{promptText}</p>

      {clip ? (
        <div className="flex flex-col gap-2">
          <video src={clip.previewUrl} controls muted className="aspect-video w-full rounded-[4px] bg-base" />
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="min-w-0 flex-1 truncate text-mute">{clip.fileName}</span>
            {!isLast && (
              <button
                type="button"
                onClick={handleFrame}
                disabled={frameState === 'working'}
                className="rounded-[4px] border border-line px-2.5 py-1 hover:border-mute disabled:opacity-40"
              >
                {frameState === 'working' ? 'Extraindo…' : 'Baixar quadro final'}
              </button>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-[4px] border border-line px-2.5 py-1 hover:border-mute"
            >
              Trocar
            </button>
            <button
              type="button"
              onClick={() => removeClip(clipKey)}
              className="rounded-[4px] border border-line px-2.5 py-1 text-mute hover:border-act3 hover:text-act3"
            >
              Remover
            </button>
          </div>
          {frameState === 'error' && (
            <p className="text-xs text-act3">Não consegui extrair o quadro. Confira se o arquivo é um MP4 válido.</p>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            accept(e.dataTransfer.files[0]);
          }}
          className={`flex aspect-video w-full items-center justify-center rounded-[4px] border border-dashed text-sm ${
            dragging ? 'border-playhead text-ink' : 'border-line text-mute hover:border-mute'
          }`}
        >
          Arraste o MP4 aqui ou clique para escolher
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
