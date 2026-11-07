'use client';

import { TAKE_SECONDS } from '@/domain/constants';
import { downloadUrl } from '@/lib/download';
import { useStudioStore, type PreviewTarget } from '@/store/useStudioStore';

const TABS: { target: PreviewTarget; label: string }[] = [
  { target: 'final', label: 'Corte final (60s)' },
  { target: 1, label: 'Take 1' },
  { target: 2, label: 'Take 2' },
  { target: 3, label: 'Take 3' },
];

/** Preview do corte final e de cada bloco de 20s, sincronizado com a timeline. */
export function PreviewPlayer() {
  const render = useStudioStore((s) => s.render);
  const preview = useStudioStore((s) => s.preview);
  const setPreview = useStudioStore((s) => s.setPreview);
  const setPlayhead = useStudioStore((s) => s.setPlayhead);

  const src = preview === 'final' ? render.finalUrl : render.takeUrls[preview - 1];
  const offset = preview === 'final' ? 0 : (preview - 1) * TAKE_SECONDS;

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Escolha o que assistir" className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={String(tab.target)}
            role="tab"
            aria-selected={preview === tab.target}
            type="button"
            onClick={() => setPreview(tab.target)}
            className={`rounded-[4px] border px-3 py-1.5 text-sm ${
              preview === tab.target
                ? 'border-playhead bg-playhead text-canvas font-semibold'
                : 'border-line text-mute hover:border-mute hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {src && (
        <video
          key={src}
          src={src}
          controls
          onTimeUpdate={(e) => setPlayhead(offset + e.currentTarget.currentTime)}
          className="aspect-video w-full rounded-[4px] bg-black"
        />
      )}

      {render.finalUrl && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => downloadUrl(render.finalUrl!, 'clash-studio-batalha.mp4')}
            className="rounded-[4px] bg-playhead px-5 py-2.5 text-sm font-semibold text-canvas"
          >
            Baixar MP4
          </button>
        </div>
      )}
    </div>
  );
}
