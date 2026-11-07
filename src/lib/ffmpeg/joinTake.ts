import { removeFiles, writeInput } from './files';
import { runFfmpeg } from './run';

/**
 * Junta os sub-clipes de um take com corte seco, sem recodificar.
 * Dentro do take não há crossfade: cada sub-clipe começa no último quadro do anterior.
 */
export async function joinTake(inputs: string[], output: string): Promise<void> {
  const listName = `${output}.txt`;
  const list = inputs.map((name) => `file '${name}'`).join('\n');
  await writeInput(listName, list);
  try {
    await runFfmpeg(['-f', 'concat', '-safe', '0', '-i', listName, '-c', 'copy', output]);
  } finally {
    await removeFiles([listName]);
  }
}
