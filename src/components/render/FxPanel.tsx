'use client';

import { FX_OPTIONS } from '@/domain/fx';
import { useStudioStore } from '@/store/useStudioStore';

/** Efeitos de edição aplicados nos clipes na prévia do take e na montagem final. */
export function FxPanel() {
  const fx = useStudioStore((s) => s.fx);
  const setFx = useStudioStore((s) => s.setFx);

  return (
    <fieldset className="flex flex-col gap-3 rounded-[4px] border border-line bg-surface p-4">
      <legend className="px-1 text-sm font-semibold">Efeitos de edição</legend>
      <p className="text-xs text-mute">
        Aplicados em cada clipe na prévia do take e na montagem. Cada clipe tem o seu lutador em foco, que define a cor.
        O impacto é marcado a 60% de cada clipe, porque o app não detecta o golpe. Com todos ligados, a montagem fica
        mais lenta.
      </p>
      <div className="grid gap-2 md:grid-cols-2">
        {FX_OPTIONS.map((option) => (
          <label
            key={option.id}
            className={`flex cursor-pointer gap-3 rounded-[4px] border p-3 ${
              fx[option.id] ? 'border-playhead bg-raised' : 'border-line hover:border-mute'
            }`}
          >
            <input
              type="checkbox"
              checked={fx[option.id]}
              onChange={(e) => setFx({ [option.id]: e.target.checked })}
              className="mt-0.5 accent-[#FFC247]"
            />
            <span className="flex flex-col gap-1">
              <span className="text-sm font-semibold">{option.label}</span>
              <span className="text-xs text-mute">{option.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
