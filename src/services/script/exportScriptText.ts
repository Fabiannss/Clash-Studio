import { CAMERA_SHOTS } from '@/domain/cameras';
import type { PromptLang } from '@/domain/lang';
import type { Beat, BattleScript, Take } from '@/domain/types';
import { formatRange } from '@/lib/timecode';
import { composeClipPrompt } from './composeClipPrompt';

export interface ScriptTextInfo {
  nameA: string;
  nameB: string;
  styleLabel: string;
  lang: PromptLang;
}

interface Clip {
  take: Take;
  beat: Beat;
  start: number;
  end: number;
}

const join = (items: string[]): string => (items.length ? items.join('; ') : '-');
const camLabel = (beat: Beat): string => CAMERA_SHOTS[beat.camera].label;
const clipName = (clip: Clip): string => `${clip.take.index}.${clip.beat.order}`;

/** Todos os clipes em ordem, com o tempo de cada um dentro dos 60s. */
function listClips(script: BattleScript): Clip[] {
  return script.takes.flatMap((take) => {
    let cursor = take.startSec;
    return take.beats.map((beat) => {
      const clip = { take, beat, start: cursor, end: cursor + beat.seconds };
      cursor += beat.seconds;
      return clip;
    });
  });
}

/** Como a câmera chega a este clipe a partir do anterior. */
function transitionText(prev: Clip | undefined, clip: Clip): string {
  if (!prev) return 'Primeiro plano do vídeo.';
  const from = `"${camLabel(prev.beat)}" (clipe ${clipName(prev)})`;
  if (prev.beat.camera === clip.beat.camera) {
    return `Mantém o mesmo ângulo do clipe anterior, ${from}.`;
  }
  if (prev.take.index !== clip.take.index) {
    return `Vem de ${from}. Crossfade de 0,3s entre os takes, e a câmera muda para este ângulo.`;
  }
  return `Vem de ${from}. Corte seco: a cena continua do último quadro do clipe anterior, com a câmera mudando para este ângulo.`;
}

/** Monta o roteiro completo em texto: mapa de câmeras, resumo de cada take e os 9 prompts prontos para o Flow. */
export function buildScriptText(script: BattleScript, info: ScriptTextInfo): string {
  const clips = listClips(script);

  const lines: string[] = [
    'CLASH STUDIO - ROTEIRO DA BATALHA',
    `${info.nameA} x ${info.nameB}`,
    `Estilo: ${info.styleLabel}`,
    `Cenário: ${script.setting}`,
    'Formato: 3 takes de 20s = 60s.',
    'Cada take tem 3 vídeos (clipes): 8s + 8s + 4s = 20s. Ao todo são 9 vídeos.',
    '',
    'COMO USAR',
    'Cole cada prompt abaixo, um por vez, em uma nova geração no Flow.',
    'Gere os dois primeiros clipes de cada take com 8s e o terceiro com 4s.',
    'Se o Flow não oferecer 4s, gere o terceiro com 8s: o Clash Studio aproveita só os 4 primeiros segundos.',
    'Para manter a cena contínua, use o último quadro de cada clipe como imagem inicial do próximo.',
    'Depois envie os MP4 no Clash Studio, na etapa Clipes.',
    '',
    '='.repeat(60),
    'MAPA DE CÂMERAS (troca de ângulo ao longo dos 60s)',
    '='.repeat(60),
  ];

  clips.forEach((clip, i) => {
    const prev = clips[i - 1];
    if (prev) {
      lines.push(prev.take.index !== clip.take.index ? '    | crossfade de 0,3s entre takes' : '    | corte seco');
    }
    lines.push(`${formatRange(clip.start, clip.end)}  Clipe ${clipName(clip)}  ${camLabel(clip.beat)}`);
  });

  for (const take of script.takes) {
    lines.push(
      '',
      '='.repeat(60),
      `TAKE ${take.index} (${formatRange(take.startSec, take.endSec)}): ${take.title}`,
      '='.repeat(60),
      `Clipes: ${take.beats.map((b) => `${b.seconds}s`).join(' + ')} = ${take.beats.reduce((sum, b) => sum + b.seconds, 0)}s`,
      `Resumo: ${take.videoPrompt}`,
      `Efeitos sonoros: ${join(take.sfx)}`,
      `Efeitos visuais: ${join(take.vfx)}`,
      `Física de combate: ${take.combatPhysics}`,
      `Evitar: ${take.negativePrompt || '-'}`,
    );

    for (const clip of clips.filter((c) => c.take.index === take.index)) {
      const shot = CAMERA_SHOTS[clip.beat.camera];
      const prev = clips[clips.indexOf(clip) - 1];
      lines.push(
        '',
        `--- CLIPE ${clipName(clip)} | ${formatRange(clip.start, clip.end)} (${clip.beat.seconds}s) ---`,
        `Câmera: ${shot.label}`,
        `Posição: ${shot.position}`,
        `Movimento: ${shot.movement}`,
        `Lente: ${shot.lens}`,
        `Troca de ângulo: ${transitionText(prev, clip)}`,
        'Prompt para o Flow:',
        composeClipPrompt(clip.beat, info.lang),
      );
    }
  }

  return lines.join('\n') + '\n';
}
