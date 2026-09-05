import type { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '@infrastructure/supabase/client.js';
import { AppError } from '@shared/errors/AppError.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Valida o token JWT emitido pelo Supabase Auth (enviado pelo frontend como
// "Authorization: Bearer <token>", automaticamente incluído pelo cliente de
// API — ver frontend/src/lib/api.ts). Nunca confia em um userId vindo do
// corpo da requisição; sempre deriva do token verificado.
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

  if (!token) {
    return next(new AppError('UNAUTHORIZED', 'Autenticação necessária.', 401));
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return next(new AppError('UNAUTHORIZED', 'Sessão inválida ou expirada.', 401));
  }

  req.userId = data.user.id;
  next();
}
