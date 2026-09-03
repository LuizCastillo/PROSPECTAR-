import { supabaseAdmin } from '@infrastructure/supabase/client.js';
import { llmProvider } from '@infrastructure/llm/index.js';
import { AppError } from '@shared/errors/AppError.js';

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

// Gera um novo protótipo (versão incremental) e salva na tabela `prompts`
// reaproveitando a mesma estrutura de versionamento dos prompts de
// desenvolvimento — só muda o `type`.
export async function generateMockup(companyId: string) {
  const company = await getCompanyById(companyId);

  const { data: lastVersion } = await supabaseAdmin
    .from('prompts')
    .select('version')
    .eq('company_id', companyId)
    .eq('type', 'website_mockup')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (lastVersion?.version ?? 0) + 1;

  const html = await llmProvider.generateWebsiteMockup({
    companyId,
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
    clientSpecifications: company.client_specifications ?? undefined,
  });

  const { data: saved, error } = await supabaseAdmin
    .from('prompts')
    .insert({
      company_id: companyId,
      type: 'website_mockup',
      content: html,
      version: nextVersion,
      model: 'mock', // TODO: refletir o model real assim que LLM_API_KEY estiver configurada
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
