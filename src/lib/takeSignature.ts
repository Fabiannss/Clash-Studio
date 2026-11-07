/** Identifica o conteúdo dos clipes de um take, para saber se a prévia ainda vale. */
export function takeSignature(files: File[]): string {
  return files.map((f) => `${f.name}:${f.size}:${f.lastModified}`).join('|');
}
