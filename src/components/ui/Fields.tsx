'use client';

import { useEffect, useId, useState } from 'react';

const baseInput =
  'w-full rounded-[4px] border border-line bg-base px-3 py-2 text-sm text-ink placeholder:text-mute ' +
  'focus:border-playhead focus:outline-none';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  mono?: boolean;
  placeholder?: string;
}

/** Campo de texto simples (uma linha) ou longo (rows > 1). */
export function TextField({ label, value, onChange, rows = 1, mono = false, placeholder }: TextFieldProps) {
  const id = useId();
  const font = mono ? 'font-mono text-xs leading-relaxed' : '';
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-mute">
        {label}
      </label>
      {rows > 1 ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} ${font} resize-y`}
        />
      ) : (
        <input
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} ${font}`}
        />
      )}
    </div>
  );
}

interface LinesFieldProps {
  label: string;
  values: string[];
  onCommit: (values: string[]) => void;
  rows?: number;
}

/**
 * Lista editada como uma linha por item. O texto fica local durante a digitação
 * (para permitir linhas vazias) e só vira array ao sair do campo.
 */
export function LinesField({ label, values, onCommit, rows = 3 }: LinesFieldProps) {
  const id = useId();
  const joined = values.join('\n');
  const [draft, setDraft] = useState(joined);

  useEffect(() => setDraft(joined), [joined]);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-mute">
        {label} (um por linha)
      </label>
      <textarea
        id={id}
        rows={rows}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() =>
          onCommit(
            draft
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
        className={`${baseInput} resize-y`}
      />
    </div>
  );
}
