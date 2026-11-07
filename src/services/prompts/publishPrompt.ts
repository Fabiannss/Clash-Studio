import type { Fighter } from '@/domain/types';

/** Prompt para o Gemini gerar títulos, descrições e tags de YouTube e TikTok. */
export function buildPublishPrompt(a: Fighter, b: Fighter, setting: string): string {
  return `Crie textos de publicação para um vídeo de 60 segundos de batalha épica em live-action.

Confronto: ${a.name} (${a.franchise}) contra ${b.name} (${b.franchise})
Cenário: ${setting}
Público: fãs de anime, mangá e quadrinhos, em português do Brasil.

Responda SOMENTE com JSON válido, sem explicações, neste formato:

{
  "youtube": {
    "titles": ["3 opções de título, até 70 caracteres cada"],
    "description": "descrição com gancho na primeira linha, contexto do confronto e chamada para comentar quem venceria",
    "tags": ["10 a 15 tags sem #"]
  },
  "tiktok": {
    "captions": ["3 opções de legenda curta"],
    "hashtags": ["5 a 8 hashtags com #"]
  }
}`;
}
