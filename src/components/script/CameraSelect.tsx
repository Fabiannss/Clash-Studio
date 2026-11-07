'use client';

import { useId } from 'react';
import { CAMERA_LIST, CAMERA_SHOTS, type CameraId } from '@/domain/cameras';
import type { Beat, TakeIndex } from '@/domain/types';
import { useStudioStore } from '@/store/useStudioStore';

/** Escolha do plano de câmera de um sub-clipe, com a posição e o movimento descritos. */
export function CameraSelect({ take, beat }: { take: TakeIndex; beat: Beat }) {
  const patchCamera = useStudioStore((s) => s.patchBeatCamera);
  const id = useId();
  const shot = CAMERA_SHOTS[beat.camera];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="shrink-0 text-xs text-mute">
          Câmera
        </label>
        <select
          id={id}
          value={beat.camera}
          onChange={(e) => patchCamera(take, beat.order, e.target.value as CameraId)}
          className="min-w-0 flex-1 rounded-[4px] border border-line bg-base px-2 py-1.5 text-xs text-ink focus:border-playhead focus:outline-none"
        >
          {CAMERA_LIST.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-mute">
        {shot.position} {shot.movement} Lente: {shot.lens}.
      </p>
    </div>
  );
}
