import { z } from 'zod';
import { BEATS_PER_TAKE, TAKE_COUNT } from './constants';

// Formato que o Gemini deve devolver. Validar aqui evita que uma resposta
// quebrada contamine o resto do app.

const beatSchema = z.object({
  prompt: z.string().min(10, 'Prompt do sub-clipe muito curto'),
});

const takeSchema = z.object({
  title: z.string().min(2),
  videoPrompt: z.string().min(10),
  cameraMoves: z.array(z.string().min(2)).min(1),
  sfx: z.array(z.string().min(2)).min(1),
  vfx: z.array(z.string().min(2)).default([]),
  combatPhysics: z.string().min(5),
  negativePrompt: z.string().default(''),
  beats: z.array(beatSchema).length(BEATS_PER_TAKE),
});

export const scriptSchema = z.object({
  setting: z.string().min(3),
  takes: z.array(takeSchema).length(TAKE_COUNT),
});
export type ScriptJson = z.infer<typeof scriptSchema>;

export const fighterSheetSchema = z.object({
  summary: z.string().min(5),
  abilities: z.array(z.string().min(2)).min(1),
  speed: z.string().min(2),
  signatureMoves: z.array(z.string().min(2)).min(1),
  visualDescription: z.string().min(10),
});
export type FighterSheetJson = z.infer<typeof fighterSheetSchema>;

export const publishSchema = z.object({
  youtube: z.object({
    titles: z.array(z.string().min(3)).min(1),
    description: z.string().min(10),
    tags: z.array(z.string().min(1)).min(3),
  }),
  tiktok: z.object({
    captions: z.array(z.string().min(3)).min(1),
    hashtags: z.array(z.string().min(1)).min(3),
  }),
});
