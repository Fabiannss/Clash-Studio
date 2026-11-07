/** Idioma dos prompts enviados ao Flow e ao Gemini. */
export type PromptLang = 'pt' | 'en';

export const PROMPT_LANGS: { id: PromptLang; label: string; hint: string }[] = [
  { id: 'pt', label: 'Português', hint: 'Prompts em português do Brasil.' },
  { id: 'en', label: 'Inglês', hint: 'O Veo costuma seguir melhor termos técnicos de câmera em inglês.' },
];
