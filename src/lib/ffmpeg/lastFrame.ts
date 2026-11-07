import { readOutput, removeFiles, writeInput } from './files';
import { runFfmpeg } from './run';

/**
 * Extrai o último quadro de um clipe. A imagem serve de quadro inicial do
 * próximo sub-clipe no Flow, para manter a continuidade da cena.
 */
export async function extractLastFrame(clip: File): Promise<Blob> {
  const input = 'lastframe-input.mp4';
  const output = 'lastframe.jpg';
  await writeInput(input, clip);
  try {
    // -update 1 sobrescreve a imagem a cada quadro; fica o último dos 0,3s finais.
    await runFfmpeg(['-sseof', '-0.3', '-i', input, '-update', '1', '-q:v', '2', output]);
    return await readOutput(output, 'image/jpeg');
  } finally {
    await removeFiles([input, output]);
  }
}
