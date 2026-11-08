'use client';

import { clipId } from '@/domain/clips';
import { BEATS_PER_TAKE } from '@/domain/constants';
import { FOCUS_OPTIONS, defaultFocus, type FocusChoice } from '@/domain/fx';
import type { ClipKey } from '@/domain/types';
import { useStudioStore } from '@/store/useStudioStore';

/** Escolhe qual lutador está em foco no clipe: define a cor do efeito. */
export function FocusSelect({ clipKey }: { clipKey: ClipKey }) {
  const value = useStudioStore(
    (s) => s.focus[clipId(clipKey)] ?? defaultFocus(clipKey.take, clipKey.beat, BEATS_PER_TAKE),
  );
  const setFocus = useStudioStore((s) => s.setFocus);

  return (
    <label className="flex items-center gap-2 text-xs text-mute">
      Lutador em foco
      <select
        value={value}
        onChange={(e) => setFocus(clipKey, e.target.value as FocusChoice)}
        className="rounded-[4px] border border-line bg-base px-2 py-1 text-ink focus:border-playhead focus:outline-none"
      >
        {FOCUS_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
