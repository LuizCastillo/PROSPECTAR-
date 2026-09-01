import { z } from 'zod';

// ---------------------------------------------------------------------------
// Schemas de saída estruturada (seções 46 e 47 da spec).
// Toda resposta da LLM é validada por aqui antes de ser persistida.
// Se a validação falhar, o caller decide: retry com correção ou AppError.llmInvalidResponse.
// ---------------------------------------------------------------------------

export const businessAnalysisSchema = z.object({
  businessType: z.string(),
  targetAudience: z.array(z.string()),
  mainGoal: z.string(),
  secondaryGoals: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  opportunities: z.array(z.string()),
  recommendations: z.array(z.string()),
});
export type BusinessAnalysis = z.infer<typeof businessAnalysisSchema>;

export const websiteStrategySchema = z.object({
  siteType: z.string(),
  objective: z.string(),
  primaryCTA: z.string(),
  secondaryCTAs: z.array(z.string()),
  pages: z.array(z.string()),
  sections: z.array(z.string()),
  features: z.array(z.string()),
  uxStrategy: z.array(z.string()),
  visualStrategy: z.array(z.string()),
  seoStrategy: z.array(z.string()),
  contentStrategy: z.array(z.string()),
});
export type WebsiteStrategy = z.infer<typeof websiteStrategySchema>;

// Todo dado factual (não interpretativo) que chega até a LLM ou sai dela
// carrega proveniência — nunca um valor "nu". Ver seção 6 da spec.
export interface SourcedValue<T = string> {
  value: T | 'UNKNOWN' | 'NOT_FOUND';
  source: string;
  confidence: number;
  collectedAt: string;
}

export interface GenerateBusinessAnalysisInput {
  companyId: string;
  companyFacts: Record<string, unknown>; // apenas dados já coletados e verificados
}

export interface GenerateWebsiteStrategyInput {
  companyId: string;
  companyFacts: Record<string, unknown>;
  businessAnalysis: BusinessAnalysis;
  brandAnalysis?: Record<string, unknown>;
  leadScore?: { score: number; temperature: string; reasons: string[] };
}

export interface GenerateWebsitePromptInput {
  companyId: string;
  companyFacts: Record<string, unknown>;
  businessAnalysis: BusinessAnalysis;
  websiteStrategy: WebsiteStrategy;
  brandAnalysis?: Record<string, unknown>;
}

export interface GenerateOutreachMessageInput {
  companyId: string;
  companyFacts: Record<string, unknown>;
  leadStatus: string;
  tone?: 'formal' | 'casual';
}

// Contrato único que qualquer fornecedor de LLM deve implementar.
// A API key do provider concreto SÓ existe no backend (env.LLM_API_KEY) —
// nunca deve trafegar para o frontend.
export interface LLMProvider {
  generateBusinessAnalysis(input: GenerateBusinessAnalysisInput): Promise<BusinessAnalysis>;
  generateWebsiteStrategy(input: GenerateWebsiteStrategyInput): Promise<WebsiteStrategy>;
  generateWebsitePrompt(input: GenerateWebsitePromptInput): Promise<string>;
  generateOutreachMessage(input: GenerateOutreachMessageInput): Promise<string>;
}
