import archiver from 'archiver';
import { PassThrough } from 'node:stream';
import { supabaseAdmin } from '@infrastructure/supabase/client.js';
import { generateWithGemini } from '@infrastructure/llm/geminiClient.js';
import { generateWithGroq } from '@infrastructure/llm/groqClient.js';
import { AppError } from '@shared/errors/AppError.js';
import { env } from '@shared/utils/env.js';
import { buildMockupPrompt } from './mockupPromptBuilder.js';
import { buildSitePrompt } from './sitePromptBuilder.js';
import { parseSiteFilesResponse, type SiteFile } from './siteFilesSchema.js';

export interface CreateCompanyInput {
  name: string;
  category?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  website?: string;
  clientSpecifications?: string;
  visualIdentity?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
}

// Todo dado aqui vem de digitação manual do usuário — não há "fonte externa"
// a rastrear, então, diferente do pipeline antigo (OSM), não há necessidade
// de metadados de confiança/proveniência por campo: o usuário É a fonte.
export async function createCompany(input: CreateCompanyInput) {
  const { data: company, error: companyError } = await supabaseAdmin
    .from('companies')
    .insert({
      name: input.name,
      category: input.category ?? null,
      address: input.address ?? null,
      city: input.city ?? null,
      state: input.state ?? null,
      postal_code: input.postalCode ?? null,
      phone: input.phone ?? null,
      website: input.website ?? null,
      client_specifications: input.clientSpecifications ?? null,
      pipeline_status: 'IMPORTED',
    })
    .select()
    .single();

  if (companyError || !company) {
    throw AppError.externalApi('Falha ao salvar empresa no banco.', companyError);
  }

  if (input.visualIdentity && Object.values(input.visualIdentity).some(Boolean)) {
    const { error: brandError } = await supabaseAdmin.from('brand_analysis').insert({
      company_id: company.id,
      primary_color: input.visualIdentity.primaryColor ?? null,
      secondary_color: input.visualIdentity.secondaryColor ?? null,
      accent_color: input.visualIdentity.accentColor ?? null,
      source: 'manual',
      confidence: 1,
    });
    if (brandError) {
      throw AppError.externalApi('Empresa criada, mas falha ao salvar identidade visual.', brandError);
    }
  }

  return company;
}

export async function listCompanies() {
  const { data, error } = await supabaseAdmin
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw AppError.externalApi('Falha ao listar empresas.', error);
  return data ?? [];
}

export async function getCompanyById(id: string) {
  const { data: company, error } = await supabaseAdmin.from('companies').select('*').eq('id', id).single();
  if (error || !company) throw AppError.notFound('Empresa não encontrada.');

  const { data: brand } = await supabaseAdmin
    .from('brand_analysis')
    .select('*')
    .eq('company_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { ...company, brand: brand ?? null };
}

async function nextPromptVersion(companyId: string, type: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from('prompts')
    .select('version')
    .eq('company_id', companyId)
    .eq('type', type)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.version ?? 0) + 1;
}

// ---------------------------------------------------------------------------
// Protótipo (Gemini) — HTML/CSS estático, gerado a partir dos dados
// cadastrados manualmente + identidade visual + especificações do cliente.
// ---------------------------------------------------------------------------
export async function generateMockup(companyId: string) {
  const company = await getCompanyById(companyId);

  const prompt = buildMockupPrompt({
    companyFacts: {
      name: company.name,
      category: company.category,
      address: company.address,
      city: company.city,
      state: company.state,
      phone: company.phone,
      website: company.website,
    },
    visualIdentity: company.brand
      ? {
          primaryColor: company.brand.primary_color,
          secondaryColor: company.brand.secondary_color,
          accentColor: company.brand.accent_color,
        }
      : undefined,
    clientSpecifications: company.client_specifications,
  });

  let html: string;
  if (env.GEMINI_API_KEY) {
    const raw = await generateWithGemini(prompt);
    // Gemini às vezes envolve a resposta em ```html ... ``` mesmo quando
    // instruído a não fazer isso — limpa antes de servir como página.
    html = raw
      .trim()
      .replace(/^```(?:html)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
  } else {
    html = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>${company.name} — Protótipo</title></head>
<body style="font-family: system-ui; padding: 40px; text-align: center;">
  <h1>${company.name}</h1>
  <p>GEMINI_API_KEY não configurada — este é um placeholder.</p>
</body>
</html>`;
  }

  const version = await nextPromptVersion(companyId, 'website_mockup');
  const { data: saved, error } = await supabaseAdmin
    .from('prompts')
    .insert({
      company_id: companyId,
      type: 'website_mockup',
      content: html,
      version,
      model: env.GEMINI_API_KEY ? env.GEMINI_MODEL : 'mock',
    })
    .select()
    .single();

  if (error || !saved) throw AppError.externalApi('Falha ao salvar protótipo gerado.', error);
  return saved;
}

export async function getMockupVersion(companyId: string, version: number) {
  const { data, error } = await supabaseAdmin
    .from('prompts')
    .select('*')
    .eq('company_id', companyId)
    .eq('type', 'website_mockup')
    .eq('version', version)
    .maybeSingle();
  if (error || !data) throw AppError.notFound('Protótipo não encontrado.');
  return data;
}

export async function getLatestMockup(companyId: string) {
  const { data, error } = await supabaseAdmin
    .from('prompts')
    .select('*')
    .eq('company_id', companyId)
    .eq('type', 'website_mockup')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) throw AppError.notFound('Nenhum protótipo gerado para essa empresa ainda.');
  return data;
}

// ---------------------------------------------------------------------------
// Site completo (Groq) — recebe o protótipo já aprovado como referência e
// gera um projeto funcional (frontend + backend), salvo como JSON de
// arquivos {path, content} e servido como .zip para download.
// ---------------------------------------------------------------------------
export async function generateFullSite(companyId: string) {
  const company = await getCompanyById(companyId);
  const mockup = await getLatestMockup(companyId); // lança 404 se ainda não houver protótipo

  if (!env.GROQ_API_KEY) {
    throw AppError.llm('GROQ_API_KEY não configurada — não é possível gerar o site completo.');
  }

  const prompt = buildSitePrompt({
    companyFacts: {
      name: company.name,
      category: company.category,
      address: company.address,
      city: company.city,
      state: company.state,
      phone: company.phone,
      website: company.website,
    },
    approvedMockupHtml: mockup.content,
    clientSpecifications: company.client_specifications,
  });

  const raw = await generateWithGroq(prompt);

  let files: SiteFile[];
  try {
    files = parseSiteFilesResponse(raw);
  } catch (err) {
    throw AppError.llmInvalidResponse(
      err instanceof Error ? err.message : 'Falha ao interpretar a resposta do Groq.',
      { rawPreview: raw.slice(0, 1000) },
    );
  }

  const version = await nextPromptVersion(companyId, 'full_site');
  const { data: saved, error } = await supabaseAdmin
    .from('prompts')
    .insert({
      company_id: companyId,
      type: 'full_site',
      content: JSON.stringify(files),
      version,
      model: env.GROQ_MODEL,
    })
    .select()
    .single();

  if (error || !saved) throw AppError.externalApi('Falha ao salvar site gerado.', error);
  return { ...saved, fileCount: files.length };
}

export async function getFullSiteFiles(companyId: string, version?: number): Promise<SiteFile[]> {
  const query = supabaseAdmin
    .from('prompts')
    .select('*')
    .eq('company_id', companyId)
    .eq('type', 'full_site');

  const { data, error } = version
    ? await query.eq('version', version).maybeSingle()
    : await query.order('version', { ascending: false }).limit(1).maybeSingle();

  if (error || !data) throw AppError.notFound('Site gerado não encontrado para essa empresa.');

  try {
    return JSON.parse(data.content) as SiteFile[];
  } catch {
    throw AppError.externalApi('Dados do site gerado estão corrompidos.');
  }
}

// Monta um .zip em memória (stream) a partir dos arquivos gerados — não
// grava nada em disco, só serve como download direto na resposta HTTP.
export function buildSiteZipStream(files: SiteFile[]): PassThrough {
  const stream = new PassThrough();
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(stream);
  for (const file of files) {
    archive.append(file.content, { name: file.path });
  }
  void archive.finalize();
  return stream;
}
