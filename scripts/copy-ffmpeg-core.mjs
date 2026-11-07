// Responsabilidade única: copiar os arquivos do FFmpeg WASM de node_modules
// para public/ffmpeg, para o navegador carregá-los do próprio domínio.
import { cp, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const jobs = [
  {
    from: 'node_modules/@ffmpeg/ffmpeg/dist/umd',
    to: 'public/ffmpeg',
    accept: (name) => name.endsWith('.js'),
  },
  {
    from: 'node_modules/@ffmpeg/core/dist/umd',
    to: 'public/ffmpeg/core',
    accept: (name) => name === 'ffmpeg-core.js' || name === 'ffmpeg-core.wasm',
  },
];

for (const job of jobs) {
  if (!existsSync(job.from)) {
    console.warn(`[clash-studio] ${job.from} não encontrado; cópia ignorada.`);
    continue;
  }
  await mkdir(job.to, { recursive: true });
  const names = (await readdir(job.from)).filter(job.accept);
  for (const name of names) {
    await cp(`${job.from}/${name}`, `${job.to}/${name}`);
  }
  console.log(`[clash-studio] ${names.length} arquivo(s) copiados para ${job.to}`);
}
