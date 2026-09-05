import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '@shared/errors/AppError.js';
import { requireAuth } from '@shared/auth/requireAuth.js';
import {
  createCompany,
  listCompanies,
  getCompanyById,
  generateMockup,
  getMockupVersion,
  getLatestMockup,
  generateFullSite,
  getFullSiteFiles,
  buildSiteZipStream,
} from './companiesService.js';

export const companiesRouter = Router();

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Cor deve estar em formato hexadecimal, ex: #5B7FFF')
  .optional();

const createCompanySchema = z.object({
  name: z.string().trim().min(2).max(200),
  category: z.string().trim().max(100).optional(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
  phone: z.string().trim().max(30).optional(),
  website: z.string().trim().max(300).optional(),
  clientSpecifications: z.string().trim().max(5000).optional(),
  visualIdentity: z
    .object({
      primaryColor: hexColor,
      secondaryColor: hexColor,
      accentColor: hexColor,
    })
    .optional(),
});

// Tudo que gerencia dados do usuário (criar, listar, ver, gerar) exige login.
// Os endpoints que SERVEM o resultado final (mockup/raw, site/download) ficam
// públicos de propósito — são links feitos para mandar ao cliente final, que
// não tem conta no sistema (mesma lógica de "qualquer um com o link" do
// Google Docs). A empresa em si só é acessível a quem é dono dela; o link
// gerado devolve conteúdo estático sem expor mais nada da conta.

companiesRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const parsed = createCompanySchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.validation('Dados da empresa inválidos.', parsed.error.flatten());
    }
    const company = await createCompany(req.userId!, parsed.data);
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
});

companiesRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json(await listCompanies(req.userId!));
  } catch (err) {
    next(err);
  }
});

companiesRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    res.json(await getCompanyById(req.params.id, req.userId!));
  } catch (err) {
    next(err);
  }
});

// Gera uma nova versão de protótipo para a empresa.
companiesRouter.post('/:id/mockup', requireAuth, async (req, res, next) => {
  try {
    const mockup = await generateMockup(req.params.id, req.userId!);
    res.status(201).json(mockup);
  } catch (err) {
    next(err);
  }
});

// Retorna o HTML cru do protótipo (a versão mais recente, ou uma específica
// via ?version=N) — pensado para ser mandado como link direto ao cliente.
// Público de propósito (ver nota acima).
companiesRouter.get('/:id/mockup/raw', async (req, res, next) => {
  try {
    const versionParam = req.query.version;
    const mockup =
      typeof versionParam === 'string'
        ? await getMockupVersion(req.params.id, Number(versionParam))
        : await getLatestMockup(req.params.id);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(mockup.content);
  } catch (err) {
    next(err);
  }
});

// Gera o site completo (frontend + backend) via Groq, usando o protótipo
// aprovado (Gemini) como referência. Exige que um protótipo já exista.
companiesRouter.post('/:id/site', requireAuth, async (req, res, next) => {
  try {
    const result = await generateFullSite(req.params.id, req.userId!);
    res.status(201).json({
      id: result.id,
      version: result.version,
      fileCount: result.fileCount,
      generatedAt: result.generated_at,
      model: result.model,
    });
  } catch (err) {
    next(err);
  }
});

// Baixa o site gerado como .zip. Público de propósito (ver nota acima).
companiesRouter.get('/:id/site/download', async (req, res, next) => {
  try {
    const versionParam = req.query.version;
    const version = typeof versionParam === 'string' ? Number(versionParam) : undefined;
    const files = await getFullSiteFiles(req.params.id, version);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="site-${req.params.id}.zip"`);
    buildSiteZipStream(files).pipe(res);
  } catch (err) {
    next(err);
  }
});
