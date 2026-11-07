'use client';

import { useState } from 'react';

interface Props {
  text: string;
  label?: string;
  className?: string;
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback para contextos sem permissão de clipboard.
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

export function CopyButton({ text, label = 'Copiar', className = '' }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function handleClick() {
    const ok = await writeClipboard(text);
    setState(ok ? 'copied' : 'failed');
    setTimeout(() => setState('idle'), 1800);
  }

  const caption = state === 'copied' ? 'Copiado' : state === 'failed' ? 'Selecione e copie' : label;
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-[4px] border border-line bg-raised px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-mute ${className}`}
    >
      {caption}
    </button>
  );
}
