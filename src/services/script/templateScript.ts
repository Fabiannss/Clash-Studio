import { CAMERA_SHOTS, DEFAULT_CAMERA_PLAN } from '@/domain/cameras';
import { TAKE_PLAN } from '@/domain/constants';
import type { PromptLang } from '@/domain/lang';
import type { ScriptJson } from '@/domain/schemas';
import { pickLook, pickNegative, pickVfxPhrase, type StyleDef } from '@/domain/styles';
import type { Fighter } from '@/domain/types';

// Roteiro de modelo, sem Gemini: serve para testar o fluxo inteiro e como
// ponto de partida editável. Todo clipe tem ação contínua do primeiro ao último
// segundo, com golpes de jogo de ação. O plano de câmera é acrescentado depois,
// no início do prompt copiado para o Flow (composeClipPrompt).

interface Words {
  setting: string;
  versus: string;
  settingLabel: string;
  fightersLabel: string;
  fallbackMove: string;
  beats: (a: string, b: string, moveA: string, moveB: string) => string[][];
}

const EN: Words = {
  setting: 'ruined stone arena at dusk, drifting embers, low fog',
  versus: 'versus',
  settingLabel: 'Setting',
  fightersLabel: 'Fighters',
  fallbackMove: 'a devastating strike',
  beats: (a, b, moveA, moveB) => [
    [
      `The two fighters lock eyes for one second, then both explode forward in a high-speed dash and clash blades in the center; ${a} lands a fast three-hit combo while ${b} parries every strike, sparks flying.`,
      `${b} counters with a spinning slash, ${a} backflips away and slides across the ground, then lunges back with ${moveA}; the blades trade blows in rapid succession.`,
      `${a} leaps high and slams down with a heavy overhead strike, ${b} blocks it, the ground cracks and a shockwave throws dust and debris outward.`,
    ],
    [
      `${b} breaks the lock and unleashes ${moveB}, a rapid chain of slashes; ${a} dodges each one with sideways dashes and vaults over the last strike.`,
      `Both fighters fight in mid-air, jumping off pillars, blades clashing with a flash on every hit; ${a} lands a kick that sends ${b} crashing through a stone column.`,
      `${b} bursts out of the rubble and charges back, ${a} meets the charge with a spinning counter, and both slide apart across the arena floor.`,
    ],
    [
      `Both fighters charge their strongest attacks, energy swirling around the blades, then rush each other at full speed.`,
      `${moveA} and ${moveB} collide in the center with a huge flash and a radial shockwave, the arena floor ripples and shatters, both pushed back but still pushing forward.`,
      `Final decisive strike: the fighters slash past each other in slow motion with sparks trailing, time snaps back, and the dust settles around two silhouettes standing in the crater.`,
    ],
  ],
};

const PT: Words = {
  setting: 'arena de pedra em ruínas ao entardecer, brasas flutuando no ar, névoa baixa',
  versus: 'contra',
  settingLabel: 'Cenário',
  fightersLabel: 'Lutadores',
  fallbackMove: 'um golpe devastador',
  beats: (a, b, moveA, moveB) => [
    [
      `Os dois lutadores se encaram por um segundo e então disparam um contra o outro em um dash em alta velocidade, e as lâminas se chocam no centro; ${a} acerta um combo rápido de três golpes enquanto ${b} defende cada um, com faíscas voando.`,
      `${b} contra-ataca com um corte giratório, ${a} dá um mortal para trás e derrapa no chão, depois volta com ${moveA}; as lâminas trocam golpes em sequência rápida.`,
      `${a} salta alto e desce com um golpe pesado por cima, ${b} bloqueia, o chão racha e uma onda de choque joga poeira e destroços para fora.`,
    ],
    [
      `${b} quebra o impasse e solta ${moveB}, uma sequência rápida de cortes; ${a} desvia de cada um com dashes laterais e pula por cima do último golpe.`,
      `Os dois lutam no ar, saltando de pilar em pilar, com as lâminas se chocando e um clarão a cada impacto; ${a} acerta um chute que lança ${b} através de uma coluna de pedra.`,
      `${b} sai dos escombros e avança de novo, ${a} recebe o ataque com um contragolpe giratório, e os dois deslizam para lados opostos no chão da arena.`,
    ],
    [
      `Os dois lutadores carregam seus golpes mais fortes, com energia girando em volta das lâminas, e correm um contra o outro em velocidade máxima.`,
      `${moveA} e ${moveB} colidem no centro com um clarão enorme e uma onda de choque radial, o chão da arena ondula e se despedaça, os dois são empurrados para trás mas continuam avançando.`,
      `Golpe final decisivo: os lutadores se cruzam em câmera lenta com faíscas deixando rastro, o tempo volta ao normal, e a poeira baixa em volta de duas silhuetas de pé na cratera.`,
    ],
  ],
};

export function templateScript(a: Fighter, b: Fighter, style: StyleDef, lang: PromptLang): ScriptJson {
  const words = lang === 'pt' ? PT : EN;
  const look = (f: Fighter) => `${f.name} (${f.visualDescription})`;
  const both = `${look(a)} ${words.versus} ${look(b)}`;
  const move = (f: Fighter) => f.signatureMoves[0] ?? words.fallbackMove;
  const styleTail = `${pickLook(style, lang)}. ${pickVfxPhrase(style, lang)}.`;
  const sets = words.beats(a.name, b.name, move(a), move(b));

  const take = (i: 0 | 1 | 2, sfx: string[], physics: string) => ({
    title: TAKE_PLAN[i].title,
    videoPrompt: `${TAKE_PLAN[i].goal} ${both}`,
    cameraMoves: DEFAULT_CAMERA_PLAN[i].map((id) => CAMERA_SHOTS[id].label),
    sfx,
    vfx: style.templateVfx[i],
    combatPhysics: physics,
    negativePrompt: pickNegative(style, lang),
    // Ação primeiro, depois aparência, cenário e estilo: o Veo dá mais peso ao começo do texto.
    beats: sets[i].map((action) => ({
      prompt: `${action} ${words.fightersLabel}: ${both}. ${words.settingLabel}: ${words.setting}. ${styleTail}`,
    })),
  });

  return {
    setting: words.setting,
    takes: [
      take(0, ['vento', 'metal raspando', 'impacto grave'], 'Impactos com peso real; poeira e fagulhas reagem à onda de choque.'),
      take(1, ['socos e lâminas em sequência', 'pedra rachando', 'respiração pesada'], 'Motion blur curto nos golpes; cenário se destrói de forma progressiva.'),
      take(2, ['carga de energia crescente', 'explosão', 'silêncio e vento'], 'Onda de choque radial; câmera lenta no pico e retomada gradual do tempo real.'),
    ],
  };
}
