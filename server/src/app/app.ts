import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { env, integrationStatus } from '@shared/utils/env.js';
import { errorHandler } from '@shared/errors/errorHandler.js';
import { healthRouter } from './health.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL ?? true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp({ redact: ['req.headers.authorization'] }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use('/health', healthRouter);

  // Módulos de domínio (companies, places, websites, ...) registram suas
  // rotas aqui conforme forem implementados nas próximas fases:
  // app.use('/api/companies', companiesRouter);

  app.use(errorHandler);

  // Log claro de quais integrações opcionais estão ativas nesta instância —
  // nunca loga o valor das chaves, só se estão presentes.
  app.locals.integrationStatus = integrationStatus;

  return app;
}
