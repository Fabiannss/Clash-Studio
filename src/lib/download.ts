/** Dispara o download de um Blob no navegador. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  downloadUrl(url, fileName);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Dispara o download de uma URL local (blob:) já existente. */
export function downloadUrl(url: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
