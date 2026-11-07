export interface ParsedQuery {
  name: string;
  franchiseHint: string;
}

/** "Guts (Berserk)" -> { name: "Guts", franchiseHint: "Berserk" } */
export function parseQuery(raw: string): ParsedQuery {
  const text = raw.trim();
  const match = text.match(/^(.*?)\s*\((.*)\)\s*$/);
  if (match) {
    return { name: match[1].trim(), franchiseHint: match[2].trim() };
  }
  return { name: text, franchiseHint: '' };
}

export function sameText(a: string, b: string): boolean {
  return a.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(a.toLowerCase());
}
