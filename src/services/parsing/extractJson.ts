import type { z, ZodTypeAny } from 'zod';

/**
 * Extrai o primeiro objeto JSON de um texto colado do Gemini. Aceita resposta
 * dentro de ```json ... ``` ou com texto antes e depois.
 */
export function extractJsonText(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : raw;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end <= start) {
    throw new Error('Não encontrei um JSON na resposta. Copie a resposta inteira do Gemini.');
  }
  return body.slice(start, end + 1);
}

export type ParseResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** Lê o JSON colado e valida com o schema; devolve o dado tipado ou uma mensagem em português. */
export function parseWithSchema<S extends ZodTypeAny>(raw: string, schema: S): ParseResult<z.output<S>> {
  let value: unknown;
  try {
    value = JSON.parse(extractJsonText(raw));
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'JSON inválido';
    return { ok: false, error: `Não consegui ler o JSON: ${reason}` };
  }

  const checked = schema.safeParse(value);
  if (checked.success) return { ok: true, data: checked.data };

  const first = checked.error.issues[0];
  const where = first.path.length ? first.path.join('.') : 'raiz';
  return { ok: false, error: `JSON fora do formato esperado em "${where}": ${first.message}` };
}
