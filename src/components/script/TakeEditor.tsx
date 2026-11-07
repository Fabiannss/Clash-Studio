'use client';

import { BEAT_SECONDS } from '@/domain/constants';
import type { Take } from '@/domain/types';
import { formatRange } from '@/lib/timecode';
import { useStudioStore } from '@/store/useStudioStore';
import { LinesField, TextField } from '../ui/Fields';
import { CameraSelect } from './CameraSelect';
import { actAccent } from '../ui/accents';

/** Edição de um take: resumo, câmera, SFX, física e os 3 prompts de sub-clipe. */
export function TakeEditor({ take }: { take: Take }) {
  const patchTake = useStudioStore((s) => s.patchTake);
  const patchBeat = useStudioStore((s) => s.patchBeat);
  const accent = actAccent[take.index];

  return (
    <section className={`flex flex-col gap-4 rounded-[4px] border-l-4 bg-surface p-5 ${accent.border}`}>
      <header className="flex flex-wrap items-baseline gap-x-3">
        <h3 className="text-lg font-extrabold">Take {take.index}</h3>
        <span className={`font-mono text-xs ${accent.text}`}>{formatRange(take.startSec, take.endSec)}</span>
      </header>

      <TextField label="Título" value={take.title} onChange={(title) => patchTake(take.index, { title })} />
      <TextField
        label="Resumo do take (prompt de vídeo)"
        value={take.videoPrompt}
        rows={3}
        onChange={(videoPrompt) => patchTake(take.index, { videoPrompt })}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <LinesField
          label="Movimentos de câmera"
          values={take.cameraMoves}
          onCommit={(cameraMoves) => patchTake(take.index, { cameraMoves })}
        />
        <LinesField label="SFX" values={take.sfx} onCommit={(sfx) => patchTake(take.index, { sfx })} />
        <LinesField
          label="Efeitos visuais"
          values={take.vfx}
          onCommit={(vfx) => patchTake(take.index, { vfx })}
        />
      </div>

      <TextField
        label="Física de combate"
        value={take.combatPhysics}
        rows={2}
        onChange={(combatPhysics) => patchTake(take.index, { combatPhysics })}
      />
      <TextField
        label="Prompt negativo"
        value={take.negativePrompt}
        onChange={(negativePrompt) => patchTake(take.index, { negativePrompt })}
      />

      <div className="flex flex-col gap-3">
        {take.beats.map((beat) => (
          <div key={beat.order} className="flex flex-col gap-2">
            <CameraSelect take={take.index} beat={beat} />
            <TextField
              mono
              rows={4}
              label={`Sub-clipe ${take.index}.${beat.order} (${BEAT_SECONDS[beat.order - 1]}s), sem o ângulo da câmera`}
              value={beat.prompt}
              onChange={(prompt) => patchBeat(take.index, beat.order, prompt)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
