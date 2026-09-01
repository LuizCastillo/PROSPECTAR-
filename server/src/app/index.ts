import { createApp } from './app.js';
import { env } from '@shared/utils/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`LeadForge API rodando na porta ${env.PORT} [${env.NODE_ENV}]`);
});
