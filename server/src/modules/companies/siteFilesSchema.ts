import { z } from 'zod';

// Caminho de arquivo seguro: relativo, sem ".." (path traversal), sem barra
// inicial. Groq nunca deve conseguir gerar um path que escape do diretório
// do projeto quando isso for gravado em disco/zip.
const safePath = z
  .string()
  .min(1)
  .max(200)
  .refine((p) => !p.startsWith('/') && !p.includes('..'), {
    message: 'Caminho de arquivo inválido (deve ser relativo, sem ".." ou "/" inicial).',
  });

export const siteFileSchema = z.object({
  path: safePath,
  content: z.string(),
});

export const siteFilesSchema = z.array(siteFileSchema).min(1).max(40);

export type SiteFile = z.infer<typeof siteFileSchema>;

// A resposta da LLM pode vir com um objeto {"files": [...]} ou um array puro
// — aceitamos os dois formatos antes de validar o conteúdo em si.
export function parseSiteFilesResponse(raw: string): SiteFile[] {
  // Remove markdown fences (```json ... ```) se a LLM ignorar a instrução de
  // responder só com JSON puro — comum o suficiente para tratar aqui.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Resposta da LLM não é um JSON válido.');
  }

  const candidate = Array.isArray(parsed) ? parsed : (parsed as { files?: unknown })?.files;
  const result = siteFilesSchema.safeParse(candidate);
  if (!result.success) {
    throw new Error(`Estrutura de arquivos inválida: ${result.error.message}`);
  }
  return result.data;
}
