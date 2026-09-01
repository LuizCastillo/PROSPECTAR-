import { Router } from 'express';
import { integrationStatus } from '@shared/utils/env.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    integrations: integrationStatus,
  });
});
