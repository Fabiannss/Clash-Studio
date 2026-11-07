'use client';

import { PROMPT_LANGS } from '@/domain/lang';
import { useStudioStore } from '@/store/useStudioStore';

/** Idioma dos prompts: vale para novos roteiros; o prompt de câmera muda na hora. */
export function PromptLanguageSelector() {
  const lang = useStudioStore((s) => s.promptLang);
  const setLang = useStudioStore((s) => s.setPromptLang);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-xs text-mute">Idioma dos prompts</legend>
      <div className="grid gap-2 md:grid-cols-2">
        {PROMPT_LANGS.map((option) => {
          const selected = lang === option.id;
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
                  name="prompt-language"
                  checked={selected}
                  onChange={() => setLang(option.id)}
                  className="accent-[#FFC247]"
                />
                {option.label}
              </span>
              <span className="text-xs text-mute">{option.hint}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
