import { CAMERA_SHOTS, DEFAULT_CAMERA_PLAN, cameraPhrase } from '@/domain/cameras';
import { BEAT_SECONDS, TAKE_PLAN } from '@/domain/constants';
import type { PromptLang } from '@/domain/lang';
import { pickLook, type StyleDef } from '@/domain/styles';
import type { Fighter } from '@/domain/types';

function fighterBlock(f: Fighter): string {
  return [
    `Lutador ${f.slot}: ${f.name} (${f.franchise})`,
    `- Resumo: ${f.summary}`,
    `- Habilidades: ${f.abilities.join('; ')}`,
    `- Velocidade: ${f.speed}`,
    `- Golpes icônicos: ${f.signatureMoves.join('; ')}`,
    `- Visual (para live-action): ${f.visualDescription}`,
  ].join('\n');
}

function cameraBlock(lang: PromptLang): string {
  return DEFAULT_CAMERA_PLAN.flatMap((shots, t) =>
    shots.map(
      (id, b) => `- Sub-clipe ${t + 1}.${b + 1}: ${CAMERA_SHOTS[id].label} (${cameraPhrase(CAMERA_SHOTS[id], lang)})`,
    ),
  ).join('\n');
}

/** Prompt mestre que o usuário cola no Gemini para gerar o roteiro. */
export function buildScriptPrompt(a: Fighter, b: Fighter, style: StyleDef, lang: PromptLang): string {
  const takes = TAKE_PLAN.map((t) => `- Take ${t.index}: ${t.goal}`).join('\n');
  const beatList = BEAT_SECONDS.map((s, i) => `sub-clipe ${i + 1} = ${s}s`).join(', ');
  const language = lang === 'pt' ? 'português do Brasil' : 'inglês';

  return `Você é diretor de cena de ação e roteirista de prompts para vídeo com IA (Veo).
Crie o roteiro de uma batalha épica entre dois personagens de universos diferentes.

${fighterBlock(a)}

${fighterBlock(b)}

Estilo visual obrigatório em TODOS os prompts de vídeo: ${pickLook(style, lang)}.
Efeitos visuais: ${style.vfxRules}
Velocidade de combate no estilo anime, mas com física coerente.

Estrutura: 3 takes de 20 segundos.
${takes}

Cada take tem 3 sub-clipes de vídeo: ${beatList}.
O sub-clipe 2 continua exatamente de onde o 1 terminou, e o 3 continua do 2.

Plano de câmera de cada sub-clipe (um ângulo diferente por clipe):
${cameraBlock(lang)}

Regras para os prompts de cada sub-clipe:
- Escreva em ${language}, em um único parágrafo, de forma que funcione sozinho no gerador de vídeo.
- Nomes de personagens e de golpes podem ficar no idioma original.
- Descreva a aparência dos dois lutadores em todo sub-clipe, para manter consistência.
- Comece o parágrafo pela ação e deixe a aparência, o ambiente e o estilo para depois, porque o gerador dá mais peso ao começo do texto.
- Todo sub-clipe tem AÇÃO CONTÍNUA do primeiro ao último segundo. Nunca use pose parada, encarada longa, silêncio tenso ou cena só de clima. No máximo 1 segundo de preparação.
- Descreva a ação em 3 momentos dentro do clipe (início, meio e fim), com movimentos de jogo de ação: dash em alta velocidade, esquiva, defesa com faíscas, combo de 3 golpes, salto com golpe aéreo, mortal, derrapada, corte giratório, golpe no chão que racha o piso, lutador arremessado contra pilar, luta de pilar em pilar.
- Cada sub-clipe termina em um golpe ou posição que o próximo clipe pode continuar.
- Não descreva o ângulo nem o movimento da câmera: o app acrescenta o plano de câmera de cada sub-clipe. Escreva uma ação que funcione bem nele; em órbita de 360°, por exemplo, os lutadores se movem em círculo e trocam golpes de todos os lados.
- Sem texto na tela, sem legendas, sem barras de vida, sem marcas d'água.

Responda SOMENTE com JSON válido, sem explicações, neste formato:

{
  "setting": "cenário único da batalha, em ${language}",
  "takes": [
    {
      "title": "título do take em português",
      "videoPrompt": "resumo do take em ${language}",
      "cameraMoves": ["movimento 1", "movimento 2"],
      "sfx": ["efeito sonoro 1", "efeito sonoro 2"],
      "vfx": ["efeito visual 1", "efeito visual 2"],
      "combatPhysics": "como a física do combate funciona neste take",
      "negativePrompt": "o que evitar, em ${language}",
      "beats": [
        { "prompt": "sub-clipe 1 em ${language}" },
        { "prompt": "sub-clipe 2 em ${language}" },
        { "prompt": "sub-clipe 3 em ${language}" }
      ]
    }
  ]
}

O array "takes" deve ter exatamente 3 itens e cada "beats" exatamente 3 itens.`;
}
