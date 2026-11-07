'use client';

import { STYLE_LIST } from '@/domain/styles';
import { useStudioStore } from '@/store/useStudioStore';

/** Escolha do estilo visual: muda o prompt mestre do Gemini e os prompts dos clipes. */
export function StyleSelector() {
  const style = useStudioStore((s) => s.style);
  const setStyle = useStudioStore((s) => s.setStyle);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-xs text-mute">Estilo visual</legend>
      <div className="grid gap-2 md:grid-cols-2">
        {STYLE_LIST.map((option) => {
          const selected = style === option.id;
          return (
            <label
              key={option.id}
              className={`flex cursor-pointer flex-col gap-1 rounded-[4px] border p-3 ${
                selected ? 'border-playhead bg-raised' : 'border-line hover:border-mute'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="radio"
                  name="visual-style"
                  checked={selected}
                  onChange={() => setStyle(option.id)}
                  className="accent-[#FFC247]"
                />
                {option.label}
              </span>
              <span className="text-xs text-mute">{option.description}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
