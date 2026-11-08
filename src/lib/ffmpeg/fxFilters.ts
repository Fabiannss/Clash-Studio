import { FIGHTER_COLORS, IMPACT_AT, type FocusChoice, type FxSettings } from '@/domain/fx';

// Responsabilidade única: transformar as opções de efeito em filtros do FFmpeg.
// Função pura, sem acesso ao FFmpeg, para poder ser testada sozinha.

export interface ClipFxPlan {
  settings: FxSettings;
  focus: FocusChoice;
  /** Duração do clipe depois do corte, em segundos. */
  seconds: number;
  width: number;
  height: number;
}

export interface FxFilters {
  /** Entra antes do filtro fps (mexe no tempo dos quadros). */
  beforeFps: string[];
  /** Entra depois do filtro fps (mexe na imagem). */
  afterFps: string[];
}

const SLOW_SECONDS = 0.4; // trecho do clipe em câmera lenta (0,5x)
const FAST_SECONDS = 0.8; // trecho acelerado (2x) que compensa o tempo perdido
const TINT_STRENGTH = 0.4;

/** Cor em componentes de croma (U e V, de 0 a 255) usados pelo vídeo. */
function chroma(hex: string): [number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return [(-0.169 * r - 0.331 * g + 0.5 * b) * 255, (0.5 * r - 0.419 * g - 0.081 * b) * 255];
}

/**
 * Desloca o croma do vídeo na direção da cor do lutador em foco.
 * Mexer só nos planos de croma é bem mais barato que um balanço de cores completo,
 * o que importa no FFmpeg WASM de um só núcleo. Com "os dois", não há tinta.
 */
function tintFilter(focus: FocusChoice): string | null {
  if (focus === 'both') return null;
  const [u, v] = chroma(FIGHTER_COLORS[focus]).map((c) => (c * TINT_STRENGTH).toFixed(1));
  return `lutyuv=u='clip(val+(${u}),0,255)':v='clip(val+(${v}),0,255)'`;
}

export function buildFxFilters(plan: ClipFxPlan): FxFilters {
  const { settings, focus, seconds, width, height } = plan;
  const impact = (seconds * IMPACT_AT).toFixed(3);
  const beforeFps: string[] = ['setpts=PTS-STARTPTS'];
  const afterFps: string[] = [];

  if (settings.slowmo) {
    const t0 = seconds * IMPACT_AT;
    const t1 = t0 + SLOW_SECONDS;
    const t2 = t1 + FAST_SECONDS;
    const sec = 'PTS*TB';
    // Linha do tempo: antes do impacto normal; lenta (0,5x) por 0,4s; acelerada (2x) por 0,8s; depois normal.
    // O tempo total do clipe não muda, então o áudio e as junções continuam alinhados.
    beforeFps.push(
      `setpts='(if(lt(${sec},${t0.toFixed(3)}),${sec},` +
        `if(lt(${sec},${t1.toFixed(3)}),${t0.toFixed(3)}+(${sec}-${t0.toFixed(3)})*2,` +
        `if(lt(${sec},${t2.toFixed(3)}),${(t0 + SLOW_SECONDS * 2).toFixed(3)}+(${sec}-${t1.toFixed(3)})*0.5,${sec}))))/TB'`,
    );
  }

  const tint = settings.tint ? tintFilter(focus) : null;
  if (tint) afterFps.push(tint);

  if (settings.impact) {
    const falloff = (span: number) => `max(0,1-abs(t-${impact})/${span})`;
    afterFps.push(
      // Aproxima 5% e recorta de volta: o tremor mexe o quadro sem mostrar bordas pretas.
      `scale=trunc(iw*1.05/2)*2:trunc(ih*1.05/2)*2`,
      `crop=${width}:${height}:x='(iw-${width})/2+16*${falloff(0.35)}*sin(70*t)':y='(ih-${height})/2+12*${falloff(0.35)}*cos(83*t)'`,
      `eq=brightness='0.3*${falloff(0.09)}':eval=frame`,
    );
  }

  if (settings.cinema) {
    afterFps.push('vignette=angle=PI/5', 'eq=contrast=1.06:saturation=1.12', 'noise=c0s=6:allf=t');
  }

  return { beforeFps, afterFps };
}
