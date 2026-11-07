import type { PromptLang } from '@/domain/lang';
import type { Fighter, FighterCandidate, FighterSlot } from '@/domain/types';

/**
 * Cria uma ficha inicial a partir da busca, sem precisar do Gemini.
 * O usuário edita os campos ou enriquece com o prompt abaixo.
 */
export function draftFighter(candidate: FighterCandidate, slot: FighterSlot): Fighter {
  return {
    slot,
    name: candidate.name,
    franchise: candidate.franchise,
    summary: candidate.description || 'Sem descrição disponível. Preencha manualmente.',
    abilities: ['A preencher'],
    speed: 'A preencher',
    signatureMoves: ['A preencher'],
    visualDescription: 'A preencher: roupa, armas, cabelo, porte físico e cores marcantes.',
    imageUrl: candidate.imageUrl,
    sourceUrl: candidate.sourceUrl,
  };
}

/** Prompt opcional para o Gemini completar a ficha técnica. */
export function buildSheetPrompt(f: Fighter, lang: PromptLang): string {
  return `Monte a ficha de combate de um personagem de ficção para uma simulação de batalha.

Personagem: ${f.name}
Franquia: ${f.franchise}
Descrição conhecida: ${f.summary}

Responda SOMENTE com JSON válido, sem explicações, neste formato:

{
  "summary": "resumo do personagem em português, até 3 frases",
  "abilities": ["habilidade 1", "habilidade 2"],
  "speed": "nível de velocidade em português, com exemplos de feitos",
  "signatureMoves": ["golpe icônico 1", "golpe icônico 2"],
  "visualDescription": "descrição visual ${lang === 'pt' ? 'em português' : 'em inglês'} (roupa, armas, cabelo, porte físico, cores) para recriar o personagem em live-action"
}`;
}
