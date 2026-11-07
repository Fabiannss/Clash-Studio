/** Formata segundos como mm:ss (ex.: 40 -> "00:40"). */
export function formatTimecode(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function formatRange(startSec: number, endSec: number): string {
  return `${formatTimecode(startSec)} – ${formatTimecode(endSec)}`;
}
